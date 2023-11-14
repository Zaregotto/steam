const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = 3000;

const url = 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+Ambience+of+Reminiscence#p1_price_asc';

let htmlTable = ''; // Зберігаємо останню відображену HTML-таблицю

async function fetchDataAndRender() {
    try {
        const response = await axios.get(url);
        const html = response.data;

        const $ = cheerio.load(html);

        const items = [];

        const promises = $('.market_listing_row').map(async (index, element) => {
            const name = $(element).find('.market_listing_item_name_block').text().trim();
            const priceElement = $(element).find('.normal_price');

            await new Promise(resolve => setTimeout(resolve, 1000));

            const rawPrice = priceElement.length ? priceElement.text().trim() : 'N/A';
            const price = parseFloat(rawPrice.replace(/[^\d.-]/g, ''));

            items.push({ name, price });
        }).get();

        await Promise.all(promises);

        // Сортування за ціною від найменшого до найбільшого
        items.sort((a, b) => a.price - b.price);

        const tableRows = items.map(item => `<tr><td>${item.name}</td><td>${item.price}</td></tr>`);
        htmlTable = `
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
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Викликаємо функцію перший раз
fetchDataAndRender();

// Затемнення функції кожні 30 секунд
setInterval(fetchDataAndRender, 30000);

// Отправляем HTML-таблицу на клиент при запиті
app.get('/', (req, res) => {
    res.send(htmlTable);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});