import { Cheerio, Element } from "cheerio";
import { ParseUtils } from "./ParseUtils";
import { ScanSettings } from "./ScanSettings";
import { Scrapper } from "./Scrapper";
import { ScrapedResult } from "./types";

export class UniversalSiteScrapper extends Scrapper {
  public constructor(
    _htmlCode: string,
    keywords: string[],
    href: string,
    scanSettings: ScanSettings
  ) {
    super(_htmlCode, scanSettings);
    this.keywords = keywords;
    this.href = href;
  }

  private keywords: string[] = [];
  private href: string = "";

  private getItemInfoFromPriceBlock(pricesBlocks: Cheerio<Element>) {
    let blocks = pricesBlocks;

    if (this.scanSettings.scanFirst) blocks = this.$(pricesBlocks.get(0));

    return blocks
      .map((_, element) => {
        const title = ParseUtils.findTitleAroundPriceByKeywords(
          this.$,
          this.$(element),
          this.keywords
        );
        return { title, price: this.$(element).text() };
      })
      .get()
      .map(({ title, price }) => ({
        title,
        prices: ParseUtils.tryParsePrice(price),
        description: "",
        type: "site",
        href: this.href,
        domain: ParseUtils.getDomain(this.href),
      }));
  }

  public scrape(): ScrapedResult[] {
    const domain = ParseUtils.getDomain(this.href);

    const scrapeSettings = this.scanSettings.customSiteScrapingSettings[domain];
    if (!!scrapeSettings && scrapeSettings.priceSelector) {
      return this.scrapeWithSettings(scrapeSettings);
    }

    let pricesBlocks = this.$(
      "span[class*=price]:contains(₽), div[class*=price]:contains(₽), p[class*=price]:contains(₽)"
    );
    if (pricesBlocks.length === 0) {
      pricesBlocks = this.$(
        "span[class*=price]:contains(руб.), div[class*=price]:contains(руб.), p[class*=price]:contains(руб.)"
      );
    }
    if (pricesBlocks.length === 0) {
      pricesBlocks = this.$(
        "span[class*=price]:contains(р.), div[class*=price]:contains(р.), p[class*=price]:contains(р.)"
      );
    }
    if (pricesBlocks.length === 0) {
      pricesBlocks = this.$(
        "span[class*=price], div[class=*price], p[class*=price]"
      );
    }

    return this.getItemInfoFromPriceBlock(pricesBlocks);
  }

  scrapeWithSettings(scrapeSettings: {
    priceSelector: string;
    titleSelector: string;
  }): ScrapedResult[] {
    const pricesBlocks = this.$(scrapeSettings.priceSelector);
    const titleBlocks = this.$(scrapeSettings.titleSelector);
    const result: ScrapedResult[] = [];

    for (let i = 0; i < pricesBlocks.length; ++i) {
      const prices = this.$(pricesBlocks.get(i)).text();
      const title = this.$(titleBlocks.get(i)).text().replace(/\s\s+/gim, "");

      result.push({
        title,
        href: this.href,
        prices: ParseUtils.tryParsePrice(prices),
        description: "",
        domain: ParseUtils.getDomain(this.href),
        type: "site",
      });
    }

    return result;
  }
}
