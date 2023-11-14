const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Масив силок з параметрами minPrice і maxPrice
const urls = [
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+When+Nature+Attacks#p1_price_asc', minPrice: 0, maxPrice: 0.2 },
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+Ambience+of+Reminiscence', minPrice: 0, maxPrice: 0.58 },
    { url: 'https://steamcommunity.com/market/search?q=Kinetic%3A+Twister&descriptions=1', minPrice: 0, maxPrice: 1.61},
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Inscribed+Torchbearer', minPrice: 0, maxPrice: 0.45},

    // Додайте інші силки тут з відповідними параметрами
];

async function fetchData() {
    const items = [];

    // Цикл для кожної силки
    for (const { url, minPrice, maxPrice } of urls) {
        try {
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);

            const promises = $('.market_listing_row').map(async (index, element) => {
                const name = $(element).find('.market_listing_item_name_block').text().trim();
                const priceElement = $(element).find('.normal_price');

                await new Promise(resolve => setTimeout(resolve, 30000));

                const rawPrice = priceElement.length ? priceElement.text().trim() : 'N/A';
                const price = parseFloat(rawPrice.replace(/[^\d.-]/g, ''));

                // Додайте умову, щоб перевірити, чи ціна потрапляє в круг пошуку
                if (price >= minPrice && price <= maxPrice) {
                    items.push({ name, price });
                }
            }).get();

            await Promise.all(promises);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error.message);
        }
    }

    // Сортування за ціною від найменшого до найбільшого
    items.sort((a, b) => a.price - b.price);

    const tableRows = items.map(item => `<tr><td>${item.name}</td><td>${item.price}</td></tr>`);
    const htmlTable = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows.join('')}
            </tbody>
        </table>
    `;
    return htmlTable;
}

app.get('/', async (req, res) => {
    try {
        const htmlTable = await fetchData();

        // Додайте параметр meta для автооновлення кожні 10 секунд
        const autoRefreshMeta = '<meta http-equiv="refresh" content="30">';

        // Додайте параметр meta до HTML-коду перед відправкою відповіді
        const responseHtml = `<html><head>${autoRefreshMeta}</head><body>${htmlTable}</body></html>`;
        res.send(responseHtml);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Задайте інтервал автооновлення даних кожні 30 секунд
const updateInterval = 30 * 3000; // 30 seconds
setInterval(async () => {
    console.log('Updating data...');
    const htmlTable = await fetchData();
    // TODO: Можливо, ви хочете відправити ці дані клієнту або оновити кеш
}, updateInterval);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});