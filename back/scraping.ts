// Библиотека для работы с файловой системой
import * as fs from "fs";
import { Browser, Page } from "puppeteer";
import _fetch from "node-fetch";

import { GoogleAdScrapper } from "./lib/GoogleAdScrapper";
import { GoogleSearchResultsScrapper } from "./lib/GoogleSearchResultsScrapper";
import { ScanSettings } from "./lib/ScanSettings";
import { ScrapedResult } from "./lib/types";
import { UniversalSiteScrapper } from "./lib/UniversalSiteScrapper";

const snooze = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));
let i = 0;
const getDataFromSite = async (
  site: string,
  scrapeSettings: ScanSettings,
  page: Page
) => {
  try {
    if (scrapeSettings.advanced) {
      await page.goto(site);
      await page.waitForSelector("html");

      return await page.content();
    } else {
      const res = await _fetch(site);
      const text = await res.text();
      fs.writeFileSync("file " + i + ".html", text, { encoding: "utf-8" });
      ++i;
      return text;
    }
  } catch (e) {
    console.error("Failed to go to " + site + " page: " + e.message);
  }
};

function* Counter(): Generator<number, number, number> {
  let count = 0;
  while (true) {
    const value = yield count;
    count += value;
  }
}

const createNewBrowserPage = async (browser: Browser) => {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  page.setDefaultNavigationTimeout(10000);
  return page;
};

export const scrapeSitesByKeyWords = async (
  keywords: any,
  scrapeSettings: ScanSettings,
  groupByDomain: boolean,
  browser: Browser,
  notifyCallback?: (msg: string, percentage: number) => void
) => {
  const counter = Counter();

  let stepCount = 2 + 3 * scrapeSettings.pageCount + 30;
  let step = Math.floor(100 / stepCount);
  let lastValue = counter.next(step).value;

  notifyCallback && notifyCallback("Подготовка...", lastValue);
  let page: Page;
  let googleSearch: ScrapedResult[] = [];

  try {
    lastValue = counter.next(step).value;
    notifyCallback && notifyCallback(`Открытие окна браузера...`, lastValue);
    page = await createNewBrowserPage(browser);

    for (let i = 0; i < scrapeSettings.pageCount; ++i) {
      const path =
        "https://google.com/search?q=" + keywords.join("+") + "&dpr=" + 1;

      lastValue = counter.next(step).value;

      notifyCallback &&
        notifyCallback(`Переход по ссылке ${path}...`, lastValue);

      const data = await getDataFromSite(path, scrapeSettings, page);

      if (scrapeSettings.scanAd) {
        lastValue = counter.next(step).value;
        notifyCallback &&
          notifyCallback("Сканируем рекламные блоки...", lastValue);
        const googleAdScrapper = new GoogleAdScrapper(data, scrapeSettings);
        googleSearch = googleSearch.concat(googleAdScrapper.scrape());
      }

      lastValue = counter.next(step).value;

      notifyCallback &&
        notifyCallback("Сканируем результаты выдачи...", lastValue);

      const googleSearchResultsScrapper = new GoogleSearchResultsScrapper(
        data,
        scrapeSettings
      );
      googleSearch = googleSearch.concat(googleSearchResultsScrapper.scrape());
    }

    const hrefs = Array.from(new Set(googleSearch.map(({ href }) => href)));

    stepCount = 2 * hrefs.length;
    step = Math.floor((100 - lastValue) / stepCount);

    let refSites: ScrapedResult[] = [];

    for (let i = 0; i < hrefs.length; ++i) {
      const href = hrefs[i];
      let html;

      notifyCallback &&
        notifyCallback(
          `Переход по ссылке ${href}...`,
          counter.next(step).value
        );

      html = await getDataFromSite(href, scrapeSettings, page);

      if (!html) continue;

      notifyCallback &&
        notifyCallback(`Скрейпим ${href}...`, counter.next(step).value);

      const siteScrapper = new UniversalSiteScrapper(
        html,
        keywords,
        href,
        scrapeSettings
      );

      refSites = refSites.concat(siteScrapper.scrape());
    }

    notifyCallback && notifyCallback(`Завершение...`, 100);

    if (groupByDomain) {
      const grouped: any = {};
      googleSearch.forEach((res) => {
        grouped[res.domain] = [...(grouped[res.domain] || []), res];
      });
      refSites.forEach((res) => {
        grouped[res.domain] = [...(grouped[res.domain] || []), res];
      });

      return grouped;
    }

    return applyFilters(scrapeSettings, [...googleSearch, ...refSites]);
  } finally {
    console.log("Close browser page...");
    if (page) page.close();
  }
};

export const scrapeSitesFromUrls = async (
  keywords: any,
  scanSettings: ScanSettings,
  groupByDomain: boolean,
  notifyCallback?: (msg: string, percentage: number) => void,
  browser?: Browser
) => {
  if (!scanSettings.urls || scanSettings.urls.length < 1) return [];
  let results: ScrapedResult[] = [];

  const steps = scanSettings.urls.length * 2;
  const stepSize = Math.round(100 / steps);
  let counter = 0;

  notifyCallback && notifyCallback("Начинаем скрейпить...", counter);

  for (let i = 0; i < scanSettings.urls.length; ++i) {
    counter += stepSize;
    const url = scanSettings.urls[i];

    const page = await createNewBrowserPage(browser);
    notifyCallback && notifyCallback(`Переходим на сайт ${url}...`, counter);

    counter += stepSize;

    const html = await getDataFromSite(url, scanSettings, page);

    const siteScrapper = new UniversalSiteScrapper(
      html,
      keywords,
      scanSettings.urls[i],
      scanSettings
    );

    notifyCallback && notifyCallback(`Скрейпим сайт ${url}...`, counter);
    results = results.concat(siteScrapper.scrape());
  }

  return applyFilters(scanSettings, results);
};

export const scrapeGoogleResultsFromContent = async (
  keywords: any,
  content: string,
  scrapeSettings: ScanSettings,
  groupByDomain: boolean,
  browser: Browser,
  notifyCallback?: (msg: string, percentage: number) => void
) => {
  let results: ScrapedResult[] = [];
  let googleSearch: ScrapedResult[] = [];

  notifyCallback ?? notifyCallback("Подготовка...", 0);

  if (scrapeSettings.scanAd) {
    notifyCallback && notifyCallback("Сканируем рекламные блоки...", 10);
    const googleAdScrapper = new GoogleAdScrapper(content, scrapeSettings);
    googleSearch = googleSearch.concat(googleAdScrapper.scrape());
  }

  notifyCallback && notifyCallback("Сканируем результаты выдачи...", 15);

  const googleSearchResultsScrapper = new GoogleSearchResultsScrapper(
    content,
    scrapeSettings
  );
  googleSearch = googleSearch.concat(googleSearchResultsScrapper.scrape());

  const hrefs = Array.from(new Set(googleSearch.map(({ href }) => href)));

  const counter = Counter();
  counter.next(20);
  const step = 75 / (hrefs.length * 2);

  let page: Page;
  try {
    page = await createNewBrowserPage(browser);

    for (let i = 0; i < hrefs.length; ++i) {
      const href = hrefs[i];
      let html;

      notifyCallback &&
        notifyCallback(
          `Переход по ссылке ${href}...`,
          counter.next(step).value
        );

      html = await getDataFromSite(href, scrapeSettings, page);

      notifyCallback &&
        notifyCallback(`Скрейпим ${href}...`, counter.next(step).value);

      const siteScrapper = new UniversalSiteScrapper(
        html,
        keywords,
        href,
        scrapeSettings
      );

      results = results.concat(siteScrapper.scrape());
    }
  } catch (e) {
    console.error(e);
    if (page) page.close();
  }

  notifyCallback && notifyCallback(`Завершение...`, 100);

  return results;
};

export const scrapeSitesFromContent = async (
  keywords: any,
  content: string,
  scanSettings: ScanSettings,
  groupByDomain: boolean,
  domain?: string,
  notifyCallback?: (msg: string, percentage: number) => void
) => {
  let results: ScrapedResult[] = [];

  notifyCallback ?? notifyCallback("Подготовка...", 0);

  const siteScrapper = new UniversalSiteScrapper(
    content,
    keywords,
    domain || "",
    scanSettings
  );

  notifyCallback ?? notifyCallback(`Скрейпим сайт...`, 50);

  results = results.concat(siteScrapper.scrape());

  notifyCallback ?? notifyCallback(`Завершение...`, 100);

  return applyFilters(scanSettings, results);
};

const applyFilters = (scanSettings: ScanSettings, data: ScrapedResult[]) => {
  let filtered = data;
  if (!scanSettings.scanWithoutPrice) {
    filtered = filtered.filter((item) => item.prices.length > 0);
  }
  if (!scanSettings.scanWithoutTitle) {
    filtered = filtered.filter((item) => !!item.title);
  }
  return filtered;
};
