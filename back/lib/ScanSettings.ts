export interface ScanSettings {
  scanAd: boolean;
  scanFirst: boolean;
  advanced: boolean;
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
