const cheerio = require('cheerio');
const request = require('request');

// Посилання на ваші сторінки
const urls = [
    'https://steamcommunity.com/market/search?q=Kinetic%3A+Ambience+of+Reminiscence&descriptions=1#p1_price_asc',
    'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+Turbulent+Teleport#p1_price_asc',
    'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+When+Nature+Attacks#p1_price_asc'
];

// Функція для парсингу інформації з кожного посилання
function parseUrl(urls) {
    request(urls, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);

            // Отримання інформації
            const normalPrice = $('.normal_price').text();
            const itemName = $('.market_listing_item_name_block').text();
            const imageSrc = $('img').attr('src');

            // Виведення результатів
            console.log(`URL: ${urls}`);
            console.log(`Ціна: ${normalPrice}`);
            console.log(`Назва предмету: ${itemName}`);
            console.log(`Шлях до зображення: ${imageSrc}`);
            console.log('---');
        } else {
            console.error(`Помилка при отриманні сторінки: ${urls}`);
        }
    });
}

// Виклик функції парсингу для кожного посилання
urls.forEach(parseUrl);