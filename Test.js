const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Масив силок з параметрами minPrice і maxPrice
const urls = [
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+When+Nature+Attacks#p1_price_asc', minPrice: 0.01, maxPrice: 0.2 },
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+Ambience+of+Reminiscence', minPrice: 0.01, maxPrice: 0.58 },
    { url: 'https://steamcommunity.com/market/search?q=Kinetic%3A+Twister&descriptions=1', minPrice: 0.01, maxPrice: 1.61},
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Inscribed+Torchbearer', minPrice: 0.01, maxPrice: 0.48},
    { url: 'https://steamcommunity.com/market/search?q=Inscribed+Coup+de+Grace+Crits&descriptions=1#p1_price_asc', minPrice: 0.01, maxPrice: 0.33},
    { url: 'https://steamcommunity.com/market/search?q=Inscribed+Dagger+Crits&descriptions=1#p1_price_asc', minPrice: 0.01, maxPrice: 0.15},
    { url: 'https://steamcommunity.com/market/search?q=kinetic+trapper%27s+treachery&descriptions=1#p1_price_asc', minPrice: 0.01, maxPrice: 1 },
    { url: 'https://steamcommunity.com/market/search?q=Warlock%27s+Summoning+Scroll&descriptions=1', minPrice: 0.01, maxPrice: 0.16 },

    // Додайте інші силки тут з відповідними параметрами
];

const notificationSound = 'https://mp3folderx.org.ua/download/46725/9429546.mp3';

async function fetchData() {
    const items = [];

    // Цикл для кожної силки
    const promises = urls.map(async ({ url, minPrice, maxPrice }) => {
        try {
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);

            const rowPromises = $('.market_listing_row').map(async (index, element) =>  {
                const name = $(element).find('.market_listing_item_name_block').text().trim();
                const priceElement = $(element).find('.normal_price');

                await new Promise(resolve => setTimeout(resolve, 5000));

                const rawPrice = priceElement.length ? priceElement.text().trim() : 'N/A';
                const price = parseFloat(rawPrice.replace(/[^\d.-]/g, ''));

                // Додайте умову, щоб перевірити, чи ціна потрапляє в круг пошуку
                if (price >= minPrice && price <= maxPrice) {
                    items.push({ name, price, source: url });
                }
            }).get();

            await Promise.all(rowPromises);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error.message);
        }
    });

    await Promise.all(promises);

    if (items.length > 0) {
        // Відтворення звуку оповіщення, якщо таблиця не порожня
        items.unshift({ name: '', price: 0, source: '' });  // Порожній name для збереження autoplay
        const playNotification = `<audio autoplay><source src="${notificationSound}" type="audio/mp3"></audio>`;
        items.unshift({ name: playNotification, price: 0, source: '' });
    }

    // Сортування за ціною від найменшого до найбільшого
    items.sort((a, b) => a.price - b.price);

    const tableRows = items.map(item => `<tr><td>${item.name}</td><td>${item.price}</td><td><a href="${item.source}" target="_blank">${item.source}</a></td></tr>`);
    const htmlTable = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Source</th>
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

        // Додайте параметр meta для автооновлення кожні 180 секунд
        const autoRefreshMeta = '<meta http-equiv="refresh" content="222">';

        // Додайте параметр meta до HTML-коду перед відправкою відповіді
        const responseHtml = `<html><head>${autoRefreshMeta}</head><body>${htmlTable}</body></html>`;
        res.send(responseHtml);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Задайте інтервал автооновлення даних кожні 180 секунд
const updateInterval = 180 * 1000; // 180 seconds
setInterval(async () => {
    console.log('Updating data...');
    const htmlTable = await fetchData();
}, updateInterval);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});



