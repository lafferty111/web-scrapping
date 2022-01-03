export interface ScanSettings {
  scanAd: boolean;
  scanFirst: boolean;
  scanWithoutPrice: boolean;
  scanWithoutTitle: boolean;
  urls?: string[];
  pageCount?: number;

  customSiteScrapingSettings?: {
    [domain: string]: {
      domain: string;
      priceSelector: string;
      titleSelector: string;
    }
  }
}
