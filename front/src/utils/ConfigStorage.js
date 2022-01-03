export class ConfigStorage {
    static getScanAd() {
        return localStorage.getItem("ad") === "true";
    }

    static setScanAd(value) {
        localStorage.setItem("ad", value);
    }

    static getScanFirst() {
        return localStorage.getItem("first") === "true";
    }

    static setScanFirst(value) {
        localStorage.setItem("first", value);
    }

    static getScanWithoutPrice() {
        return localStorage.getItem("scanWithoutPrice") === 'true';
    }

    static setScanWithoutPrice(value) {
        localStorage.setItem("scanWithoutPrice", value);
    }

    static getScanWithoutTitle() {
        return localStorage.getItem("scanWithoutTitle") === 'true';
    }

    static setScanWithoutTitle(value) {
        localStorage.setItem("scanWithoutTitle", value);
    }

    static getScanSettings() {
        return {
            scanAd: this.getScanAd(),
            scanFirst: this.getScanFirst(),
            scanWithoutPrice: this.getScanWithoutPrice(),
            scanWithoutTitle: this.getScanWithoutTitle(),
            customSiteScrapingSettings: this.getRules().reduce(
                (acc, curr) => ({ ...acc, [curr.domain]: curr }),
                {}
            ),
        };
    }

    static getRules() {
        try {
            return JSON.parse(localStorage.getItem('rules') || '[]');
        } catch (e) {
            return [];
        }
    }

    static addRule(domain, priceSelector, titleSelector) {
        const rules = this.getRules();
        rules.push({
            domain,
            priceSelector,
            titleSelector,
        });
        localStorage.setItem("rules", JSON.stringify(rules));
    }
}