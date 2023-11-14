const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Масив силок з параметрами minPrice і maxPrice
const urls = [
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+When+Nature+Attacks#p1_price_asc', minPrice: 0, maxPrice: 0.5 },
    { url: 'https://steamcommunity.com/market/search?descriptions=1&q=Kinetic%3A+Ambience+of+Reminiscence', minPrice: 1, maxPrice: 5 },
    // Додайте інші силки тут з відповідними параметрами
];

app.get('/', async (req, res) => {
    try {
        const items = [];

        // Цикл для кожної силки
        for (const { url, minPrice, maxPrice } of urls) {
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);

            const promises = $('.market_listing_row').map(async (index, element) => {
                const name = $(element).find('.market_listing_item_name_block').text().trim();
                const priceElement = $(element).find('.normal_price');

                await new Promise(resolve => setTimeout(resolve, 5000));

                const rawPrice = priceElement.length ? priceElement.text().trim() : 'N/A';
                const price = parseFloat(rawPrice.replace(/[^\d.-]/g, ''));

                // Додайте умову, щоб перевірити, чи ціна потрапляє в круг пошуку
                if (price >= minPrice && price <= maxPrice) {
                    items.push({ name, price });
                }
            }).get();

            await Promise.all(promises);
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

        res.send(htmlTable);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});