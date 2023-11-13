const request = require('request');
const cheerio = require('cheerio');

const html = '<div><span class="normal_price">Ціна</span><div class="market_listing_item_name_block">Назва предмету</div><img src="шлях/до/зображення.jpg"></div>';
const $ = cheerio.load(html);

// URL Steam Market
const steamMarketURL = 'https://steamcommunity.com/market/search?q=Kinetic%3A+Twin+Deaths%27+Haunting&descriptions=1';

// Відправка HTTP-запиту та отримання HTML-коду сторінки
request(steamMarketURL, (error, response, html) => {
    if (!error && response.statusCode === 200) {
        // Завантаження HTML-коду в об'єкт Cheerio
        const $ = cheerio.load(html);

        const normalPrice = $('.normal_price').text();
        const itemName = $('.market_listing_item_name_block').text();
        const imageSrc = $('img').attr('src');

        console.log(`Ціна: ${normalPrice}`);
        console.log(`Назва предмету: ${itemName}`);
        console.log(`Шлях до зображення: ${imageSrc}`);
    }
});