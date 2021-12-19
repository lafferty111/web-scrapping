import { Request, Response } from "express";
import { scanSitesByKeyWords } from "../scraping";

export const scanController = async (req: Request, res: Response) => {
    const { searchString, scanSettings, groupByDomain } = req.body;
    if (!searchString) return;
    const keywords = searchString.replace(/\s\s+/g, ' ').trim().split(' ');
    
    const prices = await scanSitesByKeyWords(keywords, scanSettings, groupByDomain);
    res.send(prices);
}