import { ParseUtils } from "../utils/ParseUtils";
import { ScanSettings } from "../ScanSettings";
import { Scrapper } from "./Scrapper";
import { ScrapedResult } from "../types";

export class GoogleSearchResultsScrapper extends Scrapper {
  public constructor(_htmlCode: string, scanSettings: ScanSettings) {
    super(_htmlCode, scanSettings);
  }

  public scrape(): ScrapedResult[] {
    const data: ScrapedResult[] = [];

    // Анализ поисковых результатов
    const resBlock = this.$("#rso > div");
    resBlock.map((_, element) => {
      this.$(element)
        .find("a:has(h3)")
        .filter(
          (_, a) =>
            a.attribs.href?.startsWith("http://") ||
            a.attribs.href?.startsWith("https://")
        )
        .map((_, element) => {
          let title = this.$(element).find("h3").text().replace(/\s\s+/g, " ");
          let href = element.attribs.href;
          let description: string = "";
          let subdescription: string = "";

          const descriptionBlock = this.$(element).parent().parent().get()[0];
          this.$(descriptionBlock)
            .find("> div:nth-of-type(2)")
            .map((_, element) => {
              description = this.$(element)
                .find("> div:first-of-type")
                .text()
                .replace(/\s\s+/g, " ");
              subdescription = this.$(element)
                .find("> div:nth-of-type(2)")
                .text()
                .replace(/\s\s+/g, " ");
            });

          href = href?.trim();
          title = title?.trim();
          description = description?.trim();
          subdescription = subdescription?.trim();

          const prices = Array.from(
            new Set([
              ...ParseUtils.tryParsePrice(title),
              ...ParseUtils.tryParsePrice(description),
              ...ParseUtils.tryParsePrice(subdescription),
            ])
          );

          data.push({
            title,
            href,
            prices,
            description,
            domain: ParseUtils.getDomain(href),
            type: "search",
          });
        });
    });

    return data;
  }
}
