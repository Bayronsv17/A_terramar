const https = require('https');

const checkUrl = (url) => {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`${url}: ${res.statusCode} - ${res.headers['content-type']} - Length: ${res.headers['content-length']}`);
            resolve();
        }).on('error', (e) => {
            console.log(`${url}: Error ${e.message}`);
            resolve();
        });
    });
};

(async () => {
    await checkUrl('https://webimages.terramarbrands.com.mx/shopping-cart/cart-products-gray/23082.jpg');
})();
