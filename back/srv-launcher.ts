// Библиотека для создания серверной части приложения
import * as express from "express";
// Библиотека для конвертации тела запроса в разные форматы, например, JSON
import * as bodyParser from "body-parser";
// Библиотека для конфигурации CORS
import * as cors from "cors";
// Библиотека для работы с браузером в headless режиме
import * as puppeteer from "puppeteer";
// Библиотека для работы с вебсокетами
import { WebSocketServer, WebSocket } from "ws";
// Библиотека для создания http сервера
import * as http from "http";
// Библиотека для парсинга параметров урла
import * as queryString from "query-string";

// Контроллеры для каждого эндпоинта
import { csvController } from "./controllers/export-csv-controller";
import { scanContentController, scanController, scanFromUrlsController } from "./controllers/scan-contoller";
import { scanHtmlController } from "./controllers/scan-html-contoller copy";

const app = express();
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('../front/dist'));

// Контроллер для обработки запроса сканирования
app.post("/scan", scanController);
app.post("/scan-from-urls", scanFromUrlsController);
app.post("/scan-content", scanContentController);
// Контроллер для обработки запроса сканирования из файла
app.post("/scan/html", scanHtmlController);
// Контроллер для обработки запроса экспорта в excel
app.post("/export/csv", csvController);

// Создаем http сервер
const server = http.createServer(app);

// Запускаем браузер перед запуском сервера
export let browser: puppeteer.Browser;

// Создаем вебсокет сервер
export const wss = new WebSocketServer({
  server,
});

// Кеш, в котором храним открытые вебсокет соединения - пара ключ-значение, где ключ - uuid клиента, а значение - вебсокет соединение
export const wsConnections: {[key: string]: WebSocket} = {};

// Параметры урла при соединении с вебсокетом
interface WsConnectionUrlParams {
  key?: string;
}

// Вешаем обработчики событий
wss.on("connection", (ws, req) => {
  console.log("WebSocket connection " + req.url + "!");
  // Парсим параметры урла, в котором хранится uuid клиента
  const params: WsConnectionUrlParams = queryString.parse(req.url.replace('/', ''));
  if (!params || !params.key) return;

  console.log(
    "Connection url params = ",
    JSON.stringify(params)
  );

  // Добавляем в кеш соединение с ним
  wsConnections[params.key] = ws;

  // При закрытии соединения удаляем его из кеша
  ws.on("close", (event, listener) => {
    delete wsConnections[params.key];
  });
});


// Стартуем браузер, потом http сервер
console.log("Starting headless browser...");
puppeteer.launch().then((_browser) => {
  console.log("Browser has started!");
  browser = _browser;

  server.listen(3030, () => {
    console.log("Server started on 3030 port");
  });
});
