// Библиотека для работы с файловой системой
import * as fs from "fs";

import { GoogleAdScrapper } from "./scrappers/GoogleAdScrapper";
import { GoogleSearchResultsScrapper } from "./scrappers/GoogleSearchResultsScrapper";
import { ScanSettings } from "./ScanSettings";
import { ScrapedResult } from "./types";
import { UniversalSiteScrapper } from "./scrappers/UniversalSiteScrapper";
import { browser } from "./srv-launcher";

export const scanSitesByKeyWords = async (
  keywords: any,
  scanSettings: ScanSettings,
  groupByDomain: boolean
) => {
  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );
    await page.setDefaultNavigationTimeout(10000);
    console.log(
      "Go to " +
        "https://google.com/search?q=" +
        keywords.join("+") +
        "&dpr=" +
        1 +
        "..."
    );
    await page.goto(
      "https://google.com/search?q=" + keywords.join("+") + "&dpr=" + 1
    );

    let googleSearch: ScrapedResult[] = [];
    const data = await page.content();

    if (scanSettings.scanAd) {
      const googleAdScrapper = new GoogleAdScrapper(data, scanSettings);
      googleSearch = googleSearch.concat(googleAdScrapper.scrape());
    }

    const googleSearchResultsScrapper = new GoogleSearchResultsScrapper(
      data,
      scanSettings
    );
    googleSearch = googleSearch.concat(googleSearchResultsScrapper.scrape());

    // let googleSearch: ScrapedResult[] = [];
    // const files = fs.readdirSync("../pages/google-search");
    // files.forEach((file) => {
    //   const data = fs.readFileSync("../pages/google-search/" + file, {
    //     encoding: "utf-8",
    //     flag: "r",
    //   });

    //   fs.writeFileSync(
    //     "../logs/google-search/results-" + file + ".json",
    //     JSON.stringify(googleSearch, null, "\t")
    //   );
    // });

    const hrefs = Array.from(new Set(googleSearch.map(({ href }) => href)));

    let refSites: ScrapedResult[] = [];

    for (let i = 0; i < hrefs.length; ++i) {
      const href = hrefs[i];
      let html;
      try {
        await page.goto(href);
        await page.waitForSelector("html");
        html = await page.content();
      } catch (e) {
        console.log("Error go to " + href);
        console.log(e);
        continue;
      }

      console.log("Start parsing " + href + "...");
      const siteScrapper = new UniversalSiteScrapper(
        html,
        keywords,
        href,
        scanSettings
      );

      refSites = refSites.concat(siteScrapper.scrape());

      fs.writeFileSync(
        "../logs/results-" + i + ".json",
        JSON.stringify(refSites, null, "\t")
      );
    }

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

    return [...googleSearch, ...refSites];
  } finally {
    console.log("Close browser page...");
    if (page) page.close();
  }
};
