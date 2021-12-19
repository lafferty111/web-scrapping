//@ts-ignore
import * as excel from "excel4node";
import { Response } from "express";
import { GroupedScrapedResult, ScrapedResult } from "../types";

export class ExportUtils {
  public static exportAsCsv(result: GroupedScrapedResult, res: Response) {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Результат скрейпинга");
    let row = 2;
    let col = 1;
    worksheet.cell(1, 1).string("Домен");
    worksheet.cell(1, 2).string("Ссылка");
    worksheet.cell(1, 3).string("Название товара");
    worksheet.cell(1, 4).string("Цена");

    Object.entries(result)
      .forEach(([key, value]) => {
        col = 1;

        worksheet.cell(row, col).string(key);
        ++col;
        const oldCol = col;
        value.forEach(({ href, title, prices }) => {
          col = oldCol;
          worksheet.cell(row, col).string(href);
          ++col;
          worksheet.cell(row, col).string(title);
          ++col;
          worksheet.cell(row, col).string(prices?.join(",") || "");
          ++row;
        });
        if (value.length === 0) ++row;
      });
    
    return workbook.write("result.xlsx", res);
  }
}
