import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { ScanSettings } from "../ScanSettings";
import { ScrapedResult } from "../types";

// Абстрактный класс Scrapper. Содержит общий метод для всех скрейперов и сам html код вместе с его DOM-деревом.
export abstract class Scrapper {
    protected htmlCode: string;
    protected $: CheerioAPI;
    protected scanSettings: ScanSettings;
  
    public constructor(_htmlCode: string, _scanSettings: ScanSettings) {
      this.htmlCode = _htmlCode;
      this.$ = cheerio.load(_htmlCode);
      this.scanSettings = _scanSettings;
    }
  
    public abstract scrape(): ScrapedResult[];
  }