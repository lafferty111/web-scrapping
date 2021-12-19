const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const excel = require('excel4node');
const fs = require('fs');

// Спрашиваем имя продукта
const productName = 'моторное масло 5w40'//readline.question('Type product name: ');

// Урл поискового запроса гугла (пагинация - start)
const googleUrl = (page) => 'https://google.com/search?q=' + productName.split(' ').join('+') + '+' + 'купить' + '&start=' + (page * 10);
// Google использует в поисковой выдаче в ссылках некоторые префиксы и постфиксы, которые нам не нужны - удалим
const googleHrefPrefix = '/url?q=';
const googleHrefPostfix = '&sa=';

const allRefs = [
    {
        ref: 'https://re-store.ru/apple-iphone/iphone-13/',
        title: 'Купить IPhone 13 - re:Store'
    },
    {
        ref: 'https://www.apple.com/ru/shop/buy-iphone/iphone-13',
        title: 'Купить iPhone 13 и iPhone 13 mini - Apple (RU)'
    },
    {
        ref: 'https://www.svyaznoy.ru/catalog/phone/225/apple/iphone-13',
        title: 'Apple iPhone 13 - Связной'
    },
    {
        ref: 'https://www.svyaznoy.ru/catalog/phone/225/apple/iphone-13-pro-max',
        title: 'Apple iPhone 13 Pro Max - Связной'
    },
    {
        ref: 'https://www.mvideo.ru/products/smartfon-apple-iphone-13-pro-max-128gb-graphite-mllp3ru-a-30059067',
        title: 'Купить Смартфон Apple iPhone 13 Pro Max 128GB Graphite ...'
    },
    {
        ref: 'https://www.mvideo.ru/products/smartfon-apple-iphone-13-128gb-midnight-mlnw3ru-a-30059036',
        title: 'Смартфон Apple iPhone 13 128GB Midnight (MLNW3RU/A)'
    },
    {
        ref: 'https://shop.mts.ru/catalog/smartfony/apple/iphone-13-pro/',
        title: 'Apple iPhone 13 Pro - купить Айфон 13 Про по выгодной ...'
    },
    {
        ref: 'https://www.dns-shop.ru/product/f33136ac15c9ed20/61-smartfon-apple-iphone-13-128-gb-rozovyj/',
        title: '6.1" Смартфон Apple iPhone 13 128 ГБ розовый - DNS'
    },
    {
        ref: 'https://www.eldorado.ru/c/smartfony/f/iphone-13-pro/',
        title: 'Apple iPhone 13 Pro - Смартфоны - Эльдорадо'
    },
    {
        ref: 'https://www.iport.ru/catalog/apple_iphone/iphone_13/',
        title: 'Apple iPhone 13 - Санкт-Петербург - iPort'
    },
    {
        ref: 'https://www.e-katalog.ru/APPLE-IPHONE-13-PRO-128GB.htm',
        title: 'Apple iPhone 13 Pro 128 ГБ - e-Katalog'
    },
    {
        ref: 'https://www.ozon.ru/category/iphone-13-pro/',
        title: 'iPhone 13 PRO купить по низким ценам - OZON'
    },
    {
        ref: 'https://moskva.beeline.ru/shop/details/smartfon-apple-iphone-13-128gb-tmnaya-noch/',
        title: 'Смартфон Apple iPhone 13 128GB «Тёмная ночь - Билайн'
    },
    {
        ref: 'https://www.c-store.ru/apple/iphone',
        title: 'iPhone - Cstore'
    },
    {
        ref: 'https://moscow.shop.megafon.ru/mobile/147035.html',
        title: 'Apple iPhone 13 128GB Розовый - Интернет-магазин ...'
    },
    {
        ref: 'https://market.yandex.ru/catalog--telefony/54437/list?onstock=1&deliveryincluded=0&local-offers-first=0&text=iPhone%2013&cvredirect=3&track=srch_ddl',
        title: 'iPhone 13» — Телефоны и аксессуары к ним - Яндекс.Маркет'
    },
    {
        ref: 'https://www.citilink.ru/catalog/smartfony/APPLE--iphone-13/',
        title: 'Apple iPhone 13 - Смартфоны - Ситилинк'
    },
    {
        ref: 'https://sotohit.ru/internet-magazin2/folder/apple-iphone-13-pro-max',
        title: 'Купить Apple iPhone 13 Pro Max 128GB, 256GB, 512GB, 1TB ...'
    },
    {
        ref: 'https://store77.net/apple_iphone_13/',
        title: 'Apple iPhone 13 - Москва - STORE77'
    },
    {
        ref: 'https://gbstore.ru/categories/iphone-13',
        title: 'iPhone 13 купить в интернет-магазине GBStore'
    },
    {
        ref: 'https://killprice24.ru/catalog/apple-iphone?page=all',
        title: 'Купить Apple iPhone в Красноярске по самой выгодной цене.'
    },
    {
        ref: 'https://the-istore.ru/landings/iphone_13_dostupen_v_rassrochku_0_0_12/',
        title: 'iPhone 13. Доступен в рассрочку 0-0-12. - The iStore'
    },
    {
        ref: 'https://pitergsm.ru/catalog/phones/iphone/iphone-13/',
        title: 'Купить Iphone 13 Apple в Санкт-Петербурге, цена, продажа'
    },
    {
        ref: 'http://apple-rostov.com/katalog/apple-iphone/apple-iphone-13/',
        title: 'Купить Apple iPhone 13 в Ростове - Цена Айфон 13 Ростов ...'
    },
    {
        ref: 'https://www.rbc.ru/technology_and_media/14/09/2021/6140ea1d9a7947647c0fc138',
        title: 'Apple назвала цены на линейку iPhone 13 в России - РБК'
    },
    {
        ref: 'https://lite-mobile.ru/telefony/apple/iphone-13/',
        title: 'iPhone 13: купить в СПб | Цены на Айфон 13 - Lite-Mobile'
    },
    {
        ref: 'https://www.computeruniverse.net/ru/c/smartfonyradio-gps/apple-iphone-13',
        title: 'Apple iPhone 13 купить | computeruniverse'
    },
    {
        ref: 'https://gsm-store.ru/telefony/telefony-apple-iphone/iphone-13/',
        title: 'Купить Apple iPhone 13. Лучшая цена в России - Gsm-store.ru'
    },
    {
        ref: 'https://xn----8sb1bezcm.xn--p1ai/catalog/apple-iphone-13-pro-max-128gb-graphite',
        title: 'Apple iPhone 13 Pro Max 128Gb Graphite - Ноу-Хау'
    },
    {
        ref: 'https://rg.ru/2021/09/22/v-rossiiu-prihodit-novyj-iphone-13-cena.html',
        title: 'В Россию приходит новый iPhone 13. Цена - Российская ...'
    },
    {
        ref: 'https://applestore72.ru/catalog/iphone_13/',
        title: 'Купить iPhone 13 в Тюмени - AppleStore72'
    },
    {
        ref: 'https://divizion.com/apple-1/iphone-10/',
        title: 'Apple iPhone - DIVIZION.com'
    },
    {
        ref: 'https://www.ixbt.com/news/2021/09/15/v-kakih-regionah-mira-samye-dorogie-i-deshjovye-iphone-13.html',
        title: 'В каких регионах мира самые дорогие и дешёвые iPhone 13'
    },
    {
        ref: 'https://www.kimovil.com/ru/where-to-buy-apple-iphone-13-pro',
        title: 'Цена и характеристики Apple iPhone 13 Pro - Kimovil'
    },
    {
        ref: 'https://park-mobile.ru/c/iphone-13/',
        title: 'Смартфоны iPhone 13 - купить телефон Айфон 13 в ...'
    },
    {
        ref: 'https://05.ru/catalog/portativ/phones/apple/apple_iphone_13/',
        title: 'Apple iPhone 13 - 05.RU'
    },
    {
        ref: 'https://icenter-store.ru/apple-iphone/iphone-13/',
        title: 'iPhone 13 купить в Калининграде - iCenter'
    },
    {
        ref: 'https://indexiq.ru/catalog/iphone-13/',
        title: 'Купить новый iPhone 13 в вашем городе Краснодар - indexIQ'
    },
    {
        ref: 'https://www.gazeta.ru/tech/2021/09/24/14016853/iphone13start.shtml',
        title: 'В России возник дефицит на многие версии iPhone 13'
    },
    {
        ref: 'https://sbermegamarket.ru/catalog/smartfony-apple/',
        title: 'Смартфоны Apple iPhone - купить Айфон, цены в Москве ...'
    },
    {
        ref: 'https://playboom.ru/catalog/smartfony/smartfony_apple/iphone_13_pro_max/',
        title: 'Купить Айфон 13 Про Макс о цене от производителя. Apple ...'
    },
    {
        ref: 'https://iceapple.ru/apple-iphone-13-pro-128gb-grafitoviy-7857',
        title: 'Apple iPhone 13 Pro 128GB (графитовый) - Тюмень'
    },
    {
        ref: 'https://mobile-rooms.ru/magazin/folder/apple-iphone-13-pro-ru',
        title: 'Apple iPhone 13 Pro RU'
    },
    {
        ref: 'https://www.xcom-shop.ru/apple_iphone_13_512gb_870610.html',
        title: 'Смартфон Apple iPhone 13 512GB MLPD3RU/A купить в ...'
    },
    {
        ref: 'https://ishop-center.ru/catalog/iphone_13_pro_/',
        title: 'Купить iPhone 13 Pro в Краснодаре с гарантией - iShop ...'
    },
    {
        ref: 'https://www.komus.ru/katalog/tekhnika/kompyutery-i-periferiya/smartfony/smartfon-apple-iphone-13-pro-max-128-gb-zolotistyj-mllt3ru-a-/p/1455858/',
        title: 'купить товар Смартфон Apple iPhone 13 Pro Max 128 ГБ ...'
    },
    {
        ref: 'https://www.cifrus.ru/description/1/apple_iphone_13_128gb_red_a2633',
        title: 'Купить Apple iPhone 13 128Gb Red (A2633) - Цифрус'
    },
    {
        ref: 'https://www.citrus.ua/smartfony/iphone-13-128gb-midnight-apple-696850.html',
        title: 'Apple iPhone 13 128GB Midnight (MLPF3) - Цитрус'
    },
    {
        ref: 'https://mobiltelefon.ru/post_1631643943.html',
        title: 'Официально: цена и доступность ВСЕХ iPhone 13 в России'
    },
    {
        ref: 'https://ilounge.ua/products/apple-iphone-13-1tb-kupit',
        title: 'Apple iPhone 13 512Gb Starlight (MLQD3) - iLounge'
    },
    {
        ref: 'https://www.iguides.ru/main/other/apple_pobedila_vsekh_iphone_13_dostupen_kak_nikogda/',
        title: 'Apple победила всех. iPhone 13 доступен как никогда'
    },
    {
        ref: 'https://www.cnews.ru/news/top/2021-11-23_apple_do_minimuma_sokratila',
        title: 'В России стало невозможно купить iPhone, iPad и MacBook ...'
    },
    {
        ref: 'https://www.onlinetrade.ru/catalogue/smartfony-c13/apple/smartfon_apple_iphone_13_pro_max_256gb_nebesno_goluboy_mlmj3ru_a-2804284.html',
        title: 'Смартфон Apple iPhone 13 Pro Max 256GB Небесно-голубой'
    },
    {
        ref: 'https://www.kommersant.ru/doc/5088453',
        title: 'С iPhone сыграли злую штуку - Коммерсант'
    },
    {
        ref: 'https://3dnews.ru/1048993/predstavleni-iphone-13-pro-i-13-pro-max-120gts-displei-uluchshennie-kameri-i-novie-tsveta',
        title: 'Представлены iPhone 13 Pro и 13 Pro Max — 120-Гц ...'
    },
    {
        ref: 'https://it-here.ru/novosti/iphone-13-sohranil-svoyu-stoimost-luchshe-predydushhih-modelej-iz-za-nehvatki-postavok/',
        title: 'iPhone 13 сохранил свою стоимость лучше предыдущих ...'
    },
    {
        ref: 'https://www.iphones.ru/iNotes/v-rossii-iz-za-deficita-iphone-13-vyros-spros-na-iphone-12-i-11--11-23-2021',
        title: 'В России из-за дефицита iPhone 13 вырос спрос на iPhone ...'
    },
    {
        ref: 'https://www.iphones.ru/iNotes/pomenyal-iphone-11-na-iphone-13-pro-vpechatleniy-menshe-chem-ya-dumal-11-19-2021',
        title: 'Поменял iPhone 11 на iPhone 13 Pro. Спустя месяц понял ...'
    },
    {
        ref: 'https://wylsa.com/pora-obnovitsya-sravnenie-novogo-iphone-13-c-tryohletnim-iphone-xr/',
        title: 'сравнение нового iPhone 13 c трёхлетним iPhone XR'
    },
    {
        ref: 'https://www.youtube.com/watch?v=8AM1Fo5es-E',
        title: 'iPhone 13 – Цена, дата анонса и характеристики - YouTube'
    },
    {
        ref: 'https://www.t-mobile.com/cell-phone/apple-iphone-13',
        title: 'Apple iPhone 13 | 5 colors in 512GB, 256GB & 128GB | T-Mobile'
    },
    {
        ref: 'https://www.sb.by/articles/apple-iphone-13-budet-rozovym.html',
        title: 'Apple iPhone 13 будет розовым - Беларусь сегодня'
    },
    {
        ref: 'https://appleinsider.ru/tips-tricks/ajfony-pochti-zakonchilis-vot-4-krutyx-smartfona-kotorye-sposobny-ix-zamenit.html',
        title: 'Айфоны почти закончились. Вот 4 крутых смартфона ...'
    },
    {
        ref: 'https://www.foxtrot.com.ua/ru/shop/zashchitniye_plenki_i_stekla_dlya_smartfonov_colorway_dlya_apple_iphone_13_pro_max_9h_fc_glue_black.html',
        title: 'Защитное стекло COLORWAY для Apple iPhone 13 Pro Max ...'
    },
    {
        ref: 'https://www.retail.ru/news/riteylery-stolknulis-s-defitsitom-smartfonov-apple-v-rossii-23-noyabrya-2021-211317/',
        title: 'Ритейлеры столкнулись с дефицитом смартфонов Apple...'
    },
    {
        ref: 'https://www.cnet.com/tech/mobile/iphone-13-vs-iphone-13-mini-vs-iphone-13-pro-vs-iphone-13-pro-max/',
        title: "iPhone 13 models compared: What's the difference between ..."
    },
    {
        ref: 'https://www.macrumors.com/2021/11/26/best-black-friday-iphone-deals-2021/',
        title: 'Best Black Friday iPhone Deals Still Available - MacRumors'
    },
    {
        ref: 'https://1prime.ru/business/20211126/835337438.html',
        title: 'Продукция Apple подорожала в Турции на 25% из ... - Прайм'
    },
    {
        ref: 'https://www.techradar.com/black-friday/black-friday-iphone-13-deals',
        title: 'Black Friday iPhone 13 deals: these are the best offers that ...'
    },
    {
        ref: 'https://9to5mac.com/2021/11/01/iphone-13-vs-iphone-13-pro/',
        title: 'iPhone 13 vs. iPhone 13 Pro: Which should you buy? - 9to5Mac'
    },
    {
        ref: 'https://www.tomsguide.com/reviews/iphone-13',
        title: "Apple iPhone 13 review: Everything you need to know - Tom's ..."
    },
    {
        ref: 'https://www.macworld.com/article/556058/iphone-12-mini-iphone-13-pro-max-switch-size-battery-pencil.html',
        title: 'Switching from the iPhone 12 mini to the iPhone 13 Pro Max ...'
    },
    {
        ref: 'https://megaobzor.com/V-aeroportu-Indii-iz-jali-Apple-iPhone-13-stoimostu-bolee-5-millionov-dollarov.html',
        title: 'В аэропорту Индии изъяли Apple iPhone 13 стоимостью ...'
    },
    {
        ref: 'https://srnsk.ru/2021/11/29/v-aeroportu-indii-izyaty-ustrojstva-apple-iphone-13-stoimostyu-bolee-5-mln/',
        title: 'В аэропорту Индии изъяты устройства Apple iPhone 13 ...'
    },
    {
        ref: 'https://ria.ru/20211126/apple-1760899853.html',
        title: 'Apple покажет принципиально новый гаджет для замены ...'
    },
    {
        ref: 'https://books.google.ru/books?id=MxRQEAAAQBAJ&pg=PT18&lpg=PT18&dq=Apple+iPhone+13+%D0%BA%D1%83%D0%BF%D0%B8%D1%82%D1%8C&source=bl&ots=XFeJqSA5Qb&sig=ACfU3U2Pt4_pdHFWt8OZAFi2Pg5GG7zSmQ&hl=ru',
        title: 'IPhone 13 Pro Max Photography User Guide'
    },
    {
        ref: 'https://books.google.ru/books?id=iUNOEAAAQBAJ&pg=PT36&lpg=PT36&dq=Apple+iPhone+13+%D0%BA%D1%83%D0%BF%D0%B8%D1%82%D1%8C&source=bl&ots=ZJZMniMab-&sig=ACfU3U3i_wUS6-B0_DmfeidP7RLPqgWtwQ&hl=ru',
        title: 'The iPhone 13 Pro and iPhone 13 Pro Max: The Complete and ...'
    }
];
let browser;
let page;

// Функция для получения домена по ссылке
const getDomain = ref => {
    const httpPrefix = 'http://';
    const httpsPrefix = 'https://';
    if (ref.includes(httpPrefix)) {
        const httpIndex = ref.indexOf(httpPrefix);
        return ref.substring(httpIndex + httpPrefix.length, ref.indexOf('/', httpIndex + httpPrefix.length));
    }
    if (ref.includes(httpsPrefix)) {
        const httpsIndex = ref.indexOf(httpsPrefix);
        return ref.substring(httpsIndex + httpsPrefix.length, ref.indexOf('/', httpsIndex + httpsPrefix.length));
    }
}

// Регулярное выражение для поиска цены среди текста
const pricePattern = new RegExp('(от\\s\\d+\\s?\\d+(,|\\\.)?\\d+)|(\\d+\\s?\\d+(,|\\\.)?\\d+\\s*(₽|руб|р\\\.|p\\\.))|(за\\s\\d+\\s?\\d+(,|\\\.)?\\d+)', 'gi');

(async () => {
    // Открываем браузер в хедлесс режиме (чтобы прогрузился динамический контент)
    console.log('Open browser...');
    browser = await puppeteer.launch();
    console.log('Open new page...');
    page = await browser.newPage();

    let refs = [];

    for (let i = 0; i < 10; ++i) {
        console.log('Go to ', googleUrl(i));
        await page.goto(googleUrl(i));
        const htmlPage = await page.content();

        const $ = cheerio.load(htmlPage);
        // Ищем элементы с тегом a, у которых в дочерних элементах есть тег h3, являющийся ссылкой на сайт
        // Анализ поисковых ответов и предоставленной рекламы
        refs = refs.concat($('a').map((index, element) => {
            if (!element.attribs.href) return null;
            // Убираем префиксы и постфиксы
            let normalizedRef = element.attribs.href.replace(googleHrefPrefix, '');
            if (normalizedRef.includes(googleHrefPostfix))
                normalizedRef = normalizedRef.substring(0, normalizedRef.indexOf(googleHrefPostfix));
            if (!normalizedRef.startsWith('http://') && !normalizedRef.startsWith('https://')) return null;

            // Анализ обычных поисковых ответов
            let prices = element.children
                .filter(children => children.type === "tag" && (children.name === "h3" || children.name === 'div'))
                .reduce((acc, child) => {
                    // Анализируем описание ссылки
                    const description = $(element.parent.parent).text();
                    let extracted = description.match(pricePattern) || [];

                    // Анализируем заголовок ссылки
                    const title = $(child).text();
                    const match = title.match(pricePattern);

                    // Записываем в логи то, что распарсили
                    fs.appendFileSync('logs.txt', 'DESCRIPTION === ' + description + '\nTITLE === ' + title + '\nPARSED PRICE DESCRIPTION === ' + extracted + '\nPARSED PRICE tITLE === ' + match + '\n\n\n')

                    if (match) extracted = extracted.concat(match);

                    if (extracted.length > 0) {
                        const prices = extracted.map(str => str.replace(/(от\s?)|\s|(за\s?)/gi, '')).map(number => parseFloat(number));
                        return [...acc, ...prices];
                    }
                    return acc;
                }, []);

            if (prices.length === 0) return null;

            prices = Array.from(new Set(prices));

            return { ref: normalizedRef, title: $(element.children.at(1)).text(), prices };
        }).get());

        // Если гугл выдал рекламный блок, анализируем и его
        refs = refs.concat($('a.clickable-card').map((index, element) => {
            if (element.attribs.href.startsWith('/')) return null;
            const href = element.attribs.href;
            const label = element.attribs['aria-label'];
            let prices = label.match(/\d+\s?\d+(,|\\.)?\d+\s*₽/gi).map(price => price.replace(/\s|₽/gi, '')).map(price => parseFloat(price));
            prices = Array.from(new Set(prices));
            return { ref: href, title: label, prices };
        }).get());
    }

    const groupedRefs = {};

    refs.forEach(ref => {
        const domain = getDomain(ref.ref);
        groupedRefs[domain] = {
            prices: Array.from(new Set([...((groupedRefs[domain] || {}).prices || []), ...(ref.prices || [])])),
            refs: [...((groupedRefs[domain] || {}).refs || []), ref]
        }
    })

    saveGroupedRefs2Excel(groupedRefs);

    // let curr = 10;
    // for (let i = curr; i < curr + 1; ++i) {
    //     const prices = await analyzePage(allRefs[i].ref);
    //     refs[i] = {
    //         ...refs[i],
    //         productSalePrice: prices.filter(({ productSalePrice }) => productSalePrice)
    //             .map(({ productSalePrice }) => productSalePrice).join(', '),
    //         productCommonPrice: prices.filter(({ productSalePrice }) => productSalePrice)
    //             .map(({ productCommonPrice }) => productCommonPrice).join(', ')
    //     };
    //     console.log(refs[i])
    // }

    console.log('Close browser...');
    browser.close();
})();

const analyzePage = async (ref) => {
    try {
        console.log('Goto ', ref);
        await page.goto(ref);
        const content = (await page.content()).toLowerCase();
        const notValidPage = content.includes('access denied') || content.includes('not found') || content.includes('blocked');
        if (notValidPage) {
            console.log('Access denied or not found for ref ', ref);
            return [];
        }
        const $ = cheerio.load(content);
        let prices = $('span:contains(₽)').map((_, element) => {
            let price = $(element).text().trim();
            price = price.replace(/\s+/g, '');
            let [productSalePrice, productCommonPrice] = price.split('₽');
            if (!productCommonPrice) productCommonPrice = productSalePrice;
            productSalePrice = parseFloat(productSalePrice);
            productCommonPrice = parseFloat(productCommonPrice);
            if (isNaN(productSalePrice)) productSalePrice = '';
            if (isNaN(productCommonPrice)) productCommonPrice = '';

            if (!productCommonPrice && !productSalePrice) {
                return null;
            }

            return { productSalePrice, productCommonPrice };
        }).get();

        if (prices.length > 0)
            return prices;

        console.log(1111)

        prices = $('div:contains(₽)').map((_, element) => {
            console.log($(element).text())
        })

        return [];
        // const res = await axios.get(ref);
        // const htmlPage = res.data;
        // const $ = cheerio.load(htmlPage);

        // const price = $('span:contains(₽)');
        // console.log(htmlPage);
        // console.log(price);
        // console.log(htmlPage.indexOf('₽'))
        return {};
    } catch (e) {
        console.error(e.message);
        return [];
    }
}

const saveGroupedRefs2Excel = groupedRefs => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Info');
    let row = 2;
    let col = 1;
    worksheet.cell(1, 1).string('Website domain');
    worksheet.cell(1, 2).string('Prices');
    worksheet.cell(1, 3).string('Ref');
    worksheet.cell(1, 4).string('Title');
    worksheet.cell(1, 5).string('Prices');
    Object.entries(groupedRefs).filter(([key, value]) => value.prices.length > 0).forEach(([key, value]) => {
        col = 1;
        
        worksheet.cell(row, col).string(key);
        ++col;
        worksheet.cell(row, col).string(value.prices.join(','));
        ++col;
        const oldCol = col;
        value.refs.forEach(({ref, title, prices}) => {
            col = oldCol;
            worksheet.cell(row, col).string(ref);
            ++col;
            worksheet.cell(row, col).string(title);
            ++col;
            worksheet.cell(row, col).string(prices?.join(',') || '');
            ++row;
        })
        if (value.refs.length === 0) ++row;
    })
    workbook.write('example.xlsx');
}