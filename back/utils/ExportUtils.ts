import * as fs from "fs";
//@ts-ignore
import * as excel from "excel4node";
import { GroupedScrapedResult, ScrapedResult } from "../lib/types";
import e = require("express");

export class ExportUtils {
  public static exportAsJson(
    result: ScrapedResult[] | GroupedScrapedResult,
    path = "export"
  ) {
    const jsonData = JSON.stringify(result, null, "\t");
    if (!fs.existsSync(path)) fs.mkdirSync(path);
    const filePath = `${path}/${new Date().toISOString()}`;
    fs.writeFileSync(`${filePath}}.json`, jsonData);
    console.log(`Результаты записаны в ${filePath}`);
  }

  public static async exportAsCsv(
    _result: ScrapedResult[],
    res?: any,
    path = "export"
  ) {
    const result: GroupedScrapedResult = {};

    _result.forEach((item: ScrapedResult) => {
      result[item.domain] = [...(result[item.domain] || []), item];
    });

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Результат скрейпинга");
    let row = 2;
    let col = 1;
    worksheet.cell(1, 1).string("Домен");
    worksheet.cell(1, 2).string("Ссылка");
    worksheet.cell(1, 3).string("Название товара");
    worksheet.cell(1, 4).string("Цена");

    Object.entries(result).forEach(([key, value]) => {
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

    if (!fs.existsSync(path)) fs.mkdirSync(path);
    const filePath = `${path}/${new Date().toISOString()}`;

    if (res) workbook.write(`${filePath}.xls`, res);
    else workbook.write(`${filePath}.xlsx`);
  }
}
