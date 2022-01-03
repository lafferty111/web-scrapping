import { API } from "./Api";

export class Utils {
    static downloadAsJson(items) {
        const data = JSON.stringify(items, null, "\t");
        const blob = new Blob([data], { type: "text/plain" });
        this.downloadBlob(blob, "exported-json", "json");
    }

    static async downloadAsCsv(result) {
        API.exportAsCsv(result)
            .then((res) => res.blob())
            .then((blob) => this.downloadBlob(blob, "exported-csv", "csv"));
    }

    static downloadBlob(blob, filename, extension) {
        const a = document.createElement("a");
        const blobUrl = window.URL.createObjectURL(blob);
        a.download = `exported-${this.input}.${extension}`;
        a.href = blobUrl;
        a.setAttribute("download", `${filename}.${extension}`);
        document.body.appendChild(a);
        a.click();
        a.parentNode.removeChild(a);
        window.URL.revokeObjectURL(blob);
    }
}