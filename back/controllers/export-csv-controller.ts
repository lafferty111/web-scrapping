import { Request, Response } from "express";
import { ExportUtils } from "../utils/ExportUtils";
import { GroupedScrapedResult, ScrapedResult } from "../types";

export const csvController = async (req: Request, res: Response) => {
    const scrapedResult: ScrapedResult[] = [
        {
            title: 'Apple Watch - Умные часы Эпл Вотч - Cstore',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [],
            description: 'Где купить? Apple Watch Series 7, 41 мм ...',
            domain: 'www.c-store.ru',
            type: 'search'
          },
          {
            title: 'Apple Watch SE, 40 мм, корпус из алюминия, спортивный ремешок (сияющая звезда)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [19000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch SE, 44 мм, корпус из алюминия, спортивный ремешок (темная ночь)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [20000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 41 мм, корпус из алюминия, спортивный ремешок (сияющая звезда)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [21000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 3, 38 мм, корпус из алюминия, спортивный ремешок (серебристый)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [22000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 45 мм, корпус из алюминия, спортивный ремешок (темная ночь)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [23000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 3, 42 мм, корпус из алюминия, спортивный ремешок (серый космос)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [24000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch SE, 44 мм, корпус из алюминия, спортивный ремешок (серый космос)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [25000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 45 мм, корпус из алюминия, спортивный ремешок (сияющая звезда)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [26000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 41 мм, корпус из алюминия, спортивный ремешок (зеленый)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [27000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch SE, 40 мм, корпус из алюминия, спортивный ремешок (синий омут)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [28000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 45 мм, корпус из алюминия, спортивный ремешок (синий)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [30000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 45 мм, корпус из алюминия, спортивный ремешок Nike (темная ночь)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [32000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 41 мм, корпус из алюминия, спортивный ремешок (темная ночь)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [33000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch SE, 40 мм, корпус из алюминия, спортивный ремешок (темная ночь)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [34000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch Series 7, 41 мм, корпус из алюминия, спортивный ремешок (синий)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [35000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          },
          {
            title: 'Apple Watch SE, 44 мм, корпус из алюминия, спортивный ремешок (сияющая звезда)',
            href: 'https://www.c-store.ru/apple/watch',
            prices: [40000],
            description: '',
            domain: 'www.c-store.ru',
            type: 'site'
          }
    ];
    
    const groupedJson: GroupedScrapedResult = {};
    
    scrapedResult.forEach((res: ScrapedResult) => {
        groupedJson[res.domain] = [...(groupedJson[res.domain] || []), res];
    });
    
    ExportUtils.exportAsCsv(groupedJson, res);
}