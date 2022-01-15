import { Request, Response } from "express";
import { WebSocket } from "ws";
import {
  scrapeSitesByKeyWords,
  scrapeSitesFromContent,
  scrapeSitesFromUrls,
} from "../scraping";
import { browser, wsConnections } from "../srv-launcher";
import { WsUtils } from "../utils/WsUtils";

const createProgressNotifyCallback =
  (wsConnection: WebSocket) => (msg: string, percentage: number) =>
    WsUtils.sendProgress(wsConnection, msg, percentage);

export const scanController = async (req: Request, res: Response) => {
  const { searchString, scanSettings, groupByDomain } = req.body;
  const connectionWsKey = req.headers.authorization;
  const connectionWs = wsConnections[connectionWsKey];
  if (!searchString || !connectionWsKey || !connectionWs) {
    res.status(400).send();
    return;
  }
  const keywords = searchString.replace(/\s\s+/g, " ").trim().split(" ");

  const prices = await scrapeSitesByKeyWords(
    keywords,
    scanSettings,
    groupByDomain,
    browser,
    createProgressNotifyCallback(connectionWs)
  );
  res.send(prices);
};

export const scanFromUrlsController = async (req: Request, res: Response) => {
  const { scanSettings, searchString, groupByDomain } = req.body;
  const connectionWsKey = req.headers.authorization;
  const connectionWs = wsConnections[connectionWsKey];
  if (!searchString || !connectionWsKey || !connectionWs) {
    res.status(400).send();
    return;
  }

  const keywords = searchString.replace(/\s\s+/g, " ").trim().split(" ");

  const prices = await scrapeSitesFromUrls(
    keywords,
    scanSettings,
    groupByDomain,
    createProgressNotifyCallback(connectionWs),
    browser
  );
  res.send(prices);
};

export const scanContentController = async (req: Request, res: Response) => {
  const { scanSettings, searchString, groupByDomain, content, domain } = req.body;
  const connectionWsKey = req.headers.authorization;
  const connectionWs = wsConnections[connectionWsKey];
  if (!searchString || !content || !connectionWsKey || !connectionWs) {
    res.status(400).send();
    return;
  }

  const keywords = searchString.replace(/\s\s+/g, " ").trim().split(" ");

  const prices = await scrapeSitesFromContent(
    keywords,
    content,
    scanSettings,
    groupByDomain,
    domain,
    createProgressNotifyCallback(connectionWs)
  );
  res.send(prices);
};
