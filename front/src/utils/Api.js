import { v4 as uuidv4 } from "uuid";
import { ConfigStorage } from "./ConfigStorage";

export class API {
    static wsKey = uuidv4();

    static getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: this.wsKey,
        };
    }

    static scan(searchString) {
        const scanSettings = ConfigStorage.getScanSettings();
        return fetch("http://localhost:3030/scan", {
            method: "POST",
            body: JSON.stringify({ searchString, scanSettings }),
            headers: this.getHeaders(),
        });
    }

    static scanContent(searchString, content, domain, rule) {
        let scanSettings = ConfigStorage.getScanSettings();
        if (rule && rule.domain) {
            const newPriceSelector = rule.priceSelector || scanSettings.customSiteScrapingSettings[rule.domain]?.priceSelector;
            const newTitleSelector = rule.titleSelector || scanSettings.customSiteScrapingSettings[rule.domain]?.titleSelector;
            scanSettings = {
                ...scanSettings,
                customSiteScrapingSettings: {
                    ...scanSettings.customSiteScrapingSettings,
                    [rule.domain]: {
                        domain: rule.domain,
                        priceSelector: newPriceSelector,
                        titleSelector: newTitleSelector
                    }
                }
            }
        }
        return fetch("http://localhost:3030/scan-content", {
            method: "POST",
            body: JSON.stringify({ searchString, scanSettings, domain, content }),
            headers: this.getHeaders(),
        })
    }

    static exportAsCsv(data) {
        return fetch("http://localhost:3030/export/csv", {
            method: "POST",
            body: JSON.stringify(data),
            headers: this.getHeaders(),
        })
    }

    static scanFromUrls(searchString, urls) {
        const scanSettings = ConfigStorage.getScanSettings();
        return fetch('http://localhost:3030/scan-from-urls', {
            method: 'POST',
            body: JSON.stringify({ searchString, scanSettings: { ...scanSettings, urls } }),
            headers: this.getHeaders()
        })
    }
}