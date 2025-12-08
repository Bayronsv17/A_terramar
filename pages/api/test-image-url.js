const https = require('https');

const checkUrl = (url) => {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`${url}: ${res.statusCode}`);
            resolve();
        }).on('error', (e) => {
            console.log(`${url}: Error ${e.message}`);
            resolve();
        });
    });
};

(async () => {
    await checkUrl('https://webimages.terramarbrands.com.mx/shopping-cart/cart-products-gray/23082.jpg');
    await checkUrl('https://webimages.terramarbrands.com.mx/shopping-cart/cart-products-gray/11012.jpg');
    await checkUrl('https://webimages.terramarbrands.com.mx/shopping-cart/cart-products-gray/01922.jpg');
    await checkUrl('https://webimages.terramarbrands.com.mx/shopping-cart/cart-products-gray/1922.jpg');
})();
