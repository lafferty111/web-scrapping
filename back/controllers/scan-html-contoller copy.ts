import { Request, Response } from "express";
import { UniversalSiteScrapper } from "../scrappers/UniversalSiteScrapper";

export const scanHtmlController = async (req: Request, res: Response) => {
    const { html, keywords, scanSettings } = req.body;
    const siteScrapper = new UniversalSiteScrapper(html, keywords, '', scanSettings);
    res.send(siteScrapper.scrape());
}