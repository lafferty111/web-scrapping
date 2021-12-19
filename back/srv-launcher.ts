// Библиотека для создания серверной части приложения
import * as express from "express";
// Библиотека для конвертации тела запроса в разные форматы, например, JSON
import * as bodyParser from "body-parser";
// Библиотека для конфигурации CORS
import * as cors from "cors";
// Библиотека для работы с браузером в headless режиме
import * as puppeteer from "puppeteer";

// Контроллеры для каждого эндпоинта
import { csvController } from "./controllers/export-csv-controller";
import { scanController } from "./controllers/scan-contoller";
import { scanHtmlController } from "./controllers/scan-html-contoller copy";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/scan", scanController);
app.post("/scan/html", scanHtmlController);
app.get("/export/csv", csvController);

// Запускаем браузер перед запуском сервера 
export let browser: puppeteer.Browser;

console.log("Starting headless browser...");
puppeteer.launch().then((_browser) => {
  console.log("Browser has started!");
  browser = _browser;

  app.listen(3030, () => console.log('Server started on 3030 port'));
});