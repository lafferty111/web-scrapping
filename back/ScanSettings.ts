export interface ScanSettings {
  scanAd: boolean;
  scanFirst: boolean;

  customSiteScrapingSettings?: {
    [domain: string]: {
      priceSelector: string;
      titleSelector: string;
    }
  }
}
