import { CheerioAPI } from "cheerio";

export class ParseUtils {
  // Функция для получения домена по ссылке
  public static getDomain(ref: string) {
    const httpPrefix = "http://";
    const httpsPrefix = "https://";

    if (ref.includes(httpPrefix)) {
      const httpIndex = ref.indexOf(httpPrefix);
      return ref.substring(
        httpIndex + httpPrefix.length,
        ref.indexOf("/", httpIndex + httpPrefix.length)
      );
    }

    if (ref.includes(httpsPrefix)) {
      const httpsIndex = ref.indexOf(httpsPrefix);
      return ref.substring(
        httpsIndex + httpsPrefix.length,
        ref.indexOf("/", httpsIndex + httpsPrefix.length)
      );
    }

    return "";
  }

  // Функция для парсинга даты из строки
  public static tryParsePrice(text: string): number[] {
    if (!text) return [];

    text = text.toLowerCase();
    let res = text.match(
      new RegExp(
        "(цене\\s*\\d+)|(\\d+\\s*\\d*(,|\\.)?\\d+\\s*(₽|руб|р\\.|p\\.|рублей|рубля|—))",
        "gi"
      )
    );

    if (!res) res = [];
    const match = text.match(new RegExp("(от\\s*\\d+\\s?\\d*)", "gi"));
    res = [...res, ...(match || [])];

    const normalized = res
      .map((price) =>
        price
          .replace("цене", "")
          .replace("от", "")
          .replace(/\s/g, "")
          .replace(",", ".")
      )
      .map((price) => parseFloat(price));

    return Array.from(new Set(normalized));
  }

  //Функция для поиска заголовка товара рядом с ценой по ключевым словам
  public static findTitleAroundPriceByKeywords(
    $: CheerioAPI,
    element: any,
    keywords: string[]
  ) {
    let parent = element.parent();

    while (parent.length !== 0) {
      let founded: string = "";
      const children = $(parent).children().get();

      for (let i = 0; i < children.length; ++i) {
        const text = $(children[i]).text();
        const includesKeyWord = keywords.some((word) => text.includes(word));
        if (includesKeyWord) {
          founded = text;
          break;
        }
      }

      if (founded) {
        return founded
          .split("\n")
          .filter((text) =>
            keywords.some((word) =>
              new RegExp(`\\b${word}\\b`, "gi").test(text)
            )
          )
          .join(" ")
          .replace(/\s\s+/g, " ")
          .trim();
      }

      parent = parent.parent();
    }
  }
}
