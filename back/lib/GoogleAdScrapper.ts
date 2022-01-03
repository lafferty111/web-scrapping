import { Element, Node } from "cheerio";
import { ParseUtils } from "./ParseUtils";
import { ScanSettings } from "./ScanSettings";
import { Scrapper } from "./Scrapper";
import { ScrapedResult } from "./types";

// Скрейпер для анализа рекламы гугла
export class GoogleAdScrapper extends Scrapper {
    public constructor(_htmlCode: string, scanSettings: ScanSettings) {
      super(_htmlCode, scanSettings);
    }
  
    // Реклама вначале страницы
    private tadsSelector = "#tads";
    // Реклама в конце страницы
    private tadsbSelector = "#tadsb";
    // Слайдер с рекламой
    private adSliderSelector = "div.cu-container";
  
    private handleGoogleAdLink(element: Element): ScrapedResult {
      const titleLink = this.$(element).find("a");
      // Тянем ссылку, на которую ведет результат
      const href = titleLink.map((_, {attribs}) => attribs.href).get()[0];
      // Тянем заголовок поискогового ответа вместе с описанием
      const title = this.$(titleLink)
        .find("> div:first-of-type")
        .text()
        .replace(/\s\s+/g, " ");
      const description = titleLink
        .parent()
        .parent()
        .find("> div:nth-of-type(2)")
        .text()
        .replace(/\s\s+/g, " ");
      // Пытаемся найти ценник в заголовке и в описании (вдруг там будет такая инфа)
      const prices = Array.from(
        new Set([...ParseUtils.tryParsePrice(title), ...ParseUtils.tryParsePrice(description)])
      );
      // Остальная информация - домен, тип
      const domain = ParseUtils.getDomain(href);
      const type = "ad";
      return { title, href, description, prices, domain, type };
    }
  
    private handleGoogleAdSlider(slider: Node): ScrapedResult[] {
      // Находим рекламные блоки в слайдене
      const sliderBlock = this.$(slider);
      const containers = sliderBlock.find("div.pla-unit");
      return containers
        .map((_, container) => {
          // Из каждого рекламного блока тянем ценники, заголовки, описания
          const titleLink = this.$(container).find("a.pla-unit-title-link");
          let href = titleLink.map((_, element) => element.attribs.href).get()[0];
          let prices = this.$(container)
            .find("div.pla-unit-title + div")
            .map((_, element) => this.$(element).text())
            .get()
            .map((price) => parseFloat(price.replace(/\s/g, "")));
          let title = titleLink
            .map((_, element) =>
              this.$(element.firstChild).text().replace(/\s\s+/g, " ")
            )
            .get()[0];
          let description = this.$(container)
            .find("> a.clickable-card")
            .map((_, element) => element.attribs["aria-label"] || "")
            .get()[0];
          if (!href) return;
          href = href?.trim();
          title = title?.trim();
          description = description?.trim();
          return {
            href,
            prices,
            description,
            title,
            domain: ParseUtils.getDomain(href),
            type: "ad-slider",
          };
        })
        .get();
    }
  
    // Вся логика скрейпера - анализ обычной рекламы и рекламного слайдера
    public scrape(): ScrapedResult[] {
      let scrapped: ScrapedResult[] = [];
  
      const tads = this.$(this.tadsSelector);
      const tadsb = this.$(this.tadsbSelector);
  
      const adLinks = this.$(tads).find("> div");
      scrapped = scrapped.concat(
        adLinks.map((_, element) => this.handleGoogleAdLink(element)).get()
      );
  
      const adLinksB = this.$(tadsb).find("> div");
      scrapped = scrapped.concat(
        adLinksB.map((_, element) => this.handleGoogleAdLink(element)).get()
      );
  
      const adSlider = this.$(this.adSliderSelector);
      if (adSlider.length > 0) {
        adSlider
          .get()
          .forEach((slider) =>
            scrapped = scrapped.concat(...this.handleGoogleAdSlider(slider))
          );
      }
  
      return scrapped;
    }
  }