/**

ts-node index.ts -m 1 -u "https://www.technopark.ru/umnye-chasy/filt_flagmany-apple_watch_series_7/apple/?utm_source=yandex&utm_medium=cpc&utm_campaign=1_M_Mo_Poisk_Katvendor_Cifrovaya_Chasi_Apple&utm_content=11406348068&utm_term=ST%3Asearch%7CAP%3Ano%7CPT%3Apremium%7CP%3A3%7CDT%3Adesktop%7CRI%3A213%7CRN%3A%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%7CCI%3A55416531%7CGI%3A4748951444%7CPI%3A34961400015%7CAI%3A11406348068%7CKW%3A%D0%BA%D1%83%D0%BF%D0%B8%D1%82%D1%8C%20apple%20watch%20series%207&yclid=18074707700582241168" -k Apple Watch Series 7 -e csv

ts-node index.ts -m 2 --pathToFileToScrape "../../pages/re-store/AppleWatchSeries7.html" -k Apple Watch Series 7 -e csv

ts-node index.ts -m 3 --pageCount 1 -k Apple Watch Series 7 -e json

 */

import * as yargs from "yargs";
import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";

import { ScanSettings } from "./ScanSettings";
import {
  scrapeGoogleResultsFromContent,
  scrapeSitesByKeyWords,
  scrapeSitesFromContent,
  scrapeSitesFromUrls,
} from "../scraping";
import { ScrapedResult } from "./types";
import { ExportUtils } from "../utils/ExportUtils";

interface Args {
  mode: 1 | 2 | 3 | 4;
  keywords: string[];
  pathToFileToScrape: string;
  domain: string;
  pageType: string;
  pageCount: number;
  export: string;
  urls: string[];
  scanAd: boolean;
  scanFirst: boolean;
  scanWithoutPrice: boolean;
  scanWithoutTitle: boolean;
  customSiteScrapingSettings: string;
}

const options: Args = yargs
  .usage("Usage: -u <url>")
  .option("m", {
    alias: "mode",
    describe:
      "Режим скрейпинга. 1 - по урлам, 2 - по файлу, 3 - поиск в интернете",
    type: "number",
    demandOption: true,
  })
  .options("k", {
    alias: "keywords",
    describe: "Название товара",
    type: "array",
    demandOption: true,
  })
  .option("u", {
    alias: "urls",
    describe: "Урлы сайтов для скрейпинга, разделенные запятой",
    type: "array",
    demandOption: false,
  })
  .option("a", {
    alias: "scanAd",
    describe: "Скрейпить рекламу выдачи гугла",
    type: "boolean",
    demandOption: false,
    default: true,
  })
  .option("f", {
    alias: "scanFirst",
    describe: "Скрейпить только первый попавшийся товар на сайте",
    type: "boolean",
    demandOption: false,
    default: false,
  })
  .option("d", {
    alias: "domain",
    describe: "Домен сайта для поиска правил в реестре",
    type: "string",
    demandOption: false,
    default: "",
  })
  .option("p", {
    alias: "scanWithoutPrice",
    describe: "Показывать товары без цены",
    type: "boolean",
    demandOption: false,
    default: true,
  })
  .option("t", {
    alias: "scanWithoutTitle",
    describe: "Показывать товары без названия",
    type: "boolean",
    demandOption: false,
    default: true,
  })
  .option("", {
    alias: "pathToFileToScrape",
    describe: "Путь до файла, который необходимо заскрейпить",
    type: "string",
    demandOption: false,
  })
  .option("", {
    alias: "pageCount",
    describe: "Количество страниц для скрейпинга результатов гугла",
    type: "number",
    demandOption: false,
    default: 1,
  })
  .option("e", {
    alias: "export",
    describe: "Экспортировать результат скрейпинга в json или csv файл",
    type: "string",
    demandOption: false,
    default: "",
  })
  .option("", {
    alias: "pageType",
    describe: "Тип страницы для скрейпинга - google или site",
    type: "string",
    demandOption: false,
    default: "",
  })
  .option("r", {
    alias: "customSiteScrapingSettings",
    describe: "Путь до json-файла с правилами сканирования",
    type: "string",
    demandOption: false,
  }).argv as unknown as Args;

let rules: {
  [domain: string]: {
    domain: string;
    priceSelector: string;
    titleSelector: string;
  };
} = {};

if (options.customSiteScrapingSettings)
  rules = JSON.parse(
    fs.readFileSync(options.customSiteScrapingSettings, { encoding: "utf-8" })
  );

const scrapeSettings: ScanSettings = {
  scanAd: options.scanAd,
  scanFirst: options.scanFirst,
  scanWithoutPrice: options.scanWithoutPrice,
  scanWithoutTitle: options.scanWithoutTitle,
  urls: options.urls,
  pageCount: options.pageCount,

  customSiteScrapingSettings: rules,
};

puppeteer.launch().then(async (browser) => {
  console.log("Браузер запущен!");
  let results: ScrapedResult[] = [];
  switch (options.mode) {
    // Скрейпинг по урлам
    case 1:
      if (scrapeSettings.urls?.length < 1) {
        console.log("Введите урлы");
        break;
      }

      results = await scrapeSitesFromUrls(
        options.keywords,
        scrapeSettings,
        false,
        (msg, percentage) => console.log(`${percentage}%: ${msg}`),
        browser
      );
      break;
    // Скрейпинг по файлу
    case 2:
      if (!options.pathToFileToScrape) {
        console.log("Введите путь до файла");
        return;
      }
      if (!options.pageType) {
        console.log("Введите тип файла");
        return;
      }
      const filePath = path.join(process.cwd(), options.pathToFileToScrape);
      const data = fs.readFileSync(filePath, {
        encoding: "utf-8",
      });

      if (options.pageType === "google") {
        results = await scrapeGoogleResultsFromContent(
          options.keywords,
          data,
          scrapeSettings,
          false,
          browser,
          (msg, percentage) => console.log(`${percentage}%: ${msg}`)
        );
      } else {
        results = await scrapeSitesFromContent(
          options.keywords,
          data,
          scrapeSettings,
          false,
          options.domain,
          (msg, percentage) => console.log(`${percentage}%: ${msg}`)
        );
      }
      break;
    // Скрейпинг поиском в гугле
    case 3:
      results = await scrapeSitesByKeyWords(
        options.keywords,
        scrapeSettings,
        false,
        browser,
        (msg, percentage) => console.log(`${percentage}%: ${msg}`)
      );
      break;
    default:
      console.log("Неизвестный режим скрейпинга.");
      break;
  }

  switch (options.export) {
    case "json":
      ExportUtils.exportAsJson(results);
      break;
    case "csv":
      ExportUtils.exportAsCsv(results);
      break;
    default:
      console.log(results);
  }
});
