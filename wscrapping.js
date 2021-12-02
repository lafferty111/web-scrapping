// Библиотека для работы с DOM
const cheerio = require('cheerio');
// Библиотека для работы с браузером в headless режиме
const puppeteer = require('puppeteer');
// Библиотека для генерации excel файла
const excel = require('excel4node');
// Библиотека для работы с файловой системой
const fs = require('fs');

// Функция для парсинга даты из строки
const tryParsePrice = text => {
    if (!text) return [];

    text = text.toLowerCase();
    let res = text.match(new RegExp('(цене\\s*\\d+)|(\\d+\\s*\\d*(,|\\\.)?\\d+\\s*(₽|руб|р\\\.|p\\\.|рублей|рубля|—))', 'gi'));
    if (!res) res = [];
    const match = text.match(new RegExp('(от\\s*\\d+\\s?\\d*)', 'gi'));
    res = [...res, ...(match || [])];

    const normalized = res.map(price => price.replace('цене', '').replace('от', '').replace(/\s/g, '').replace(',', '.'))
        .map(price => parseFloat(price));

    return Array.from(new Set(normalized));
}

//Функция для поиска заголовка товара рядом с ценой по ключевым словам
const findTitleAroundPriceByKeywords = ($, element, keywords) => {
    let parent = element.parent();
    while (parent.length !== 0) {
        let founded;

        $(parent).children().each((_, el) => {
            if (el === element.get()[0]) return;
            const text = $(el).text();
            const includesKeyWord = keywords.some(word => text.includes(word));
            if (includesKeyWord) {
                founded = text;
            }
        });

        if (founded) {
            // console.log(founded.split('\n'))
            return founded.split('\n').filter(text => keywords.some(word => new RegExp(`\\b${word}\\b`, 'gi').test(text))).join(' ').replace(/\s\s+/g, ' ').trim();
        }

        parent = parent.parent();
    }
}

// Анализ рекламы гугл
const analyzeAd = htmlCode => {
    const data = [];

    const $ = cheerio.load(htmlCode);
    // Реклама вначале страницы
    const tads = $('#tads');
    // Реклама в конце страницы
    const tadsb = $('#tadsb');

    const handleGoogleAdLink = (element) => {
        const titleLink = $(element).find('a');
        const href = titleLink.map((_, element) => element.attribs.href).get()[0];
        const title = $(titleLink).find('> div:first-of-type').text().replace(/\s\s+/g, ' ');
        const description = titleLink.parent().parent().find('> div:nth-of-type(2)').text().replace(/\s\s+/g, ' ');
        const prices = Array.from(new Set([...tryParsePrice(title), ...tryParsePrice(description)]));
        data.push({ href, title, description, prices, type: 'ad' })
    };

    const adLinks = $(tads).find('> div');
    adLinks.map((_, element) => handleGoogleAdLink(element));

    const adLinksB = $(tadsb).find('> div');
    adLinksB.map((_, element) => handleGoogleAdLink(element));

    // Анализ слайдера с рекламой
    const adSlider = $('div.cu-container');
    if (adSlider.length > 0) {
        adSlider.get().forEach(slider => {
            const sliderBlock = $(slider);
            const containers = sliderBlock.find('div.pla-unit');
            containers.map((_, container) => {
                const titleLink = $(container).find('a.pla-unit-title-link');
                let href = titleLink.map((_, element) => element.attribs.href).get()[0];
                let prices = $(container).find('div.pla-unit-title + div').map((_, element) => $(element).text()).get()
                    .map(price => parseFloat(price.replace(/\s/g, '')));
                let title = titleLink.map((_, element) => $(element.firstChild).text().replace(/\s\s+/g, ' ')).get()[0];
                let description = $(container).find('> a.clickable-card').map((_, element) => element.attribs['aria-label'] || '')
                    .get()[0];
                if (!href) return;
                href = href?.trim();
                title = title?.trim();
                description = description?.trim();
                data.push({ href, prices, description, title, type: 'ad-slider' });
            })
        });
    }

    // Анализ поисковых результатов
    const resBlock = $('#rso > div');
    resBlock.map((_, element) => {
        $(element).find('a:has(h3)').filter((_, a) => a.attribs.href?.startsWith('http://') || a.attribs.href?.startsWith('https://'))
            .map((_, element) => {
                let title = $(element).find('h3').text().replace(/\s\s+/g, ' ');
                let href = element.attribs.href;
                let description;
                let subdescription;

                const descriptionBlock = $(element).parent().parent().get()[0];
                $(descriptionBlock).find('> div:nth-of-type(2)')
                    .map((_, element) => {
                        description = $(element).find('> div:first-of-type').text().replace(/\s\s+/g, ' ');
                        subdescription = $(element).find('> div:nth-of-type(2)').text().replace(/\s\s+/g, ' ');
                    });

                href = href?.trim();
                title = title?.trim();
                description = description?.trim();
                subdescription = subdescription?.trim();

                const prices = Array.from(new Set([...tryParsePrice(title), ...tryParsePrice(description), ...tryParsePrice(subdescription)]));

                data.push({ title, href, prices, description, subdescription, type: 'search' });
            })
    })

    return data;
}

let googleSearch = [];
const files = fs.readdirSync('pages/google-search');
files.forEach(file => {
    const data = fs.readFileSync('pages/google-search/' + file, { encoding: 'utf-8', flag: 'r' });
    googleSearch = [...googleSearch, ...analyzeAd(data)];
    fs.writeFileSync('logs/google-search/results-' + file + '.json', JSON.stringify(googleSearch, null, '\t'));
})

const hrefs = googleSearch.map(({ href }) => href);

let browser;
let page;

(async () => {
    const keywords = ['Apple', 'Watch', 'Series', '7'];

    // Открываем браузер в хедлесс режиме (чтобы прогрузился динамический контент)
    console.log('Open browser...');
    browser = await puppeteer.launch({
        // headless: false
    });
    console.log('Open new page...');
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    for (let i = 0; i < 10; ++i) {
        const href = hrefs[i];
        let html;
        try {
            await page.goto(href);
            await page.waitForSelector('html');
            html = await page.content();
        } catch (e) {
            console.log('Error go to ' + href);
            console.log(e)
            continue;
        }

        const $ = cheerio.load(html);

        console.log("START PARSING..." + href);
        let pricesBlocks = $('span[class*=price]:contains(₽), div[class*=price]:contains(₽), p[class*=price]:contains(₽)');
        let prices = [];
        if (pricesBlocks.length > 0) {
            pricesBlocks.map((_, element) => {
                const title = findTitleAroundPriceByKeywords($, $(element), keywords);
                return { title, price: $(element).text() };
            }).get().forEach(({ title, price }) => prices = [...prices, { title, prices: tryParsePrice(price) }]);
        } else {
            pricesBlocks = $('span[class*=price]:contains(руб.), div[class*=price]:contains(руб.), p[class*=price]:contains(руб.)');
            if (pricesBlocks.length > 0) {
                pricesBlocks.map((_, element) => {
                    const title = findTitleAroundPriceByKeywords($, $(element), keywords);
                    return { title, price: $(element).text() };
                }).get().forEach(({ title, price }) => prices = [...prices, { title, prices: tryParsePrice(price) }]);
            } else {
                pricesBlocks = $('span[class*=price]:contains(р.), div[class*=price]:contains(р.), p[class*=price]:contains(р.)');
                if (pricesBlocks.length > 0) {
                    pricesBlocks.map((_, element) => {
                        const title = findTitleAroundPriceByKeywords($, $(element), keywords);
                        return { title, price: $(element).text() };
                    }).get().forEach(({ title, price }) => prices = [...prices, { title, prices: tryParsePrice(price) }]);
                } else {
                    pricesBlocks = $('span[class*=price], div[class=*price], p[class*=price]');
                    pricesBlocks.map((_, element) => {
                        const title = findTitleAroundPriceByKeywords($, $(element), keywords);
                        return { title, price: $(element).text() };
                    }).get().forEach(({ title, price }) => prices = [...prices, { title, prices: tryParsePrice(price) }]);
                }
            }
        }

        console.log(prices)
    }
})();
