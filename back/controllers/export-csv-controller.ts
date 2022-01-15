import { Request, Response } from "express";
import { ExportUtils } from "../utils/ExportUtils";
import { ScrapedResult } from "../lib/types";

export const csvController = async (req: Request, res: Response) => {
    const scrapedResult: ScrapedResult[] = req.body;
    
    ExportUtils.exportAsCsv(scrapedResult, res);
}