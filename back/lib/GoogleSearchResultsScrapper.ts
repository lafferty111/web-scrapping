import { ParseUtils } from "./ParseUtils";
import { ScanSettings } from "./ScanSettings";
import { Scrapper } from "./Scrapper";
import { ScrapedResult } from "./types";

export class GoogleSearchResultsScrapper extends Scrapper {
  public constructor(_htmlCode: string, scanSettings: ScanSettings) {
    super(_htmlCode, scanSettings);
  }

  public scrape(): ScrapedResult[] {
    const data: ScrapedResult[] = [];

    if (this.scanSettings.advanced) {
      // Анализ поисковых результатов в случае продвинутого поиска (классы и айдишники динамически изменяются в зависимости от работы в браузере и получением через fetch)
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
            let title = this.$(element)
              .find("h3")
              .text()
              .replace(/\s\s+/g, " ");
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
    } else {
      const resBlock = this.$("div#main > div");
      resBlock.map((_, element) => {
        this.$(element)
          .find("a:has(h3)")
          .filter((_, a) => {
            return (
              a.attribs.href?.startsWith("/url?q=http://") ||
              a.attribs.href?.startsWith("/url?q=https://")
            );
          })
          .map((_, element) => {
            let title = this.$(element)
              .find("h3")
              .text()
              .replace(/\s\s+/g, " ");
            let href = element.attribs.href.replace("/url?q=", "");
            let description: string = "";
            let subdescription: string = "";

            const descriptionBlock = this.$(element).parent().parent().children().get()[2];
            this.$(descriptionBlock).map((_, element) => {
              description = this.$(element).text().replace(/\s\s+/g, " ");
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
    }

    return data;
  }
}
