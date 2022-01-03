export interface ScrapedResult {
  title: string;
  href: string;
  prices: number[];
  description: string;
  domain: string;
  type: string;
}

export interface GroupedScrapedResult {
  [domain: string]: ScrapedResult[];
}