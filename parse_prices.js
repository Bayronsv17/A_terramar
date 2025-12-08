const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('folleto_de_mes.csv', 'utf8');

// Normalize content: remove newlines inside phrases to make regex easier? 
// No, line based might be better.

const keyPriceMap = {};

// Strategy:
// Match all occurrences of "de $X" and their position.
// Match all occurrences of "Clave Y" and their position.
// For each "Clave Y", find the closest "de $X" that appears BEFORE it (within a reasonable distance)
// OR maybe implies a block structure.

// Regex for prices: "de\s*\$([\d,]+\.?\d*)"
const priceRegex = /de\s*\$([\d,]+\.?\d*)/g;
const prices = [];
let match;
while ((match = priceRegex.exec(content)) !== null) {
    prices.push({
        price: parseFloat(match[1].replace(/,/g, '')),
        index: match.index
    });
}

// Regex for keys: "Clave\s*([0-9A-Z-]+)" or just numbers if 5 digits? 
// The user prompt shows "Clave 21063".
// Let's use strict "Clave" prefix to avoid false positives.
const keyRegex = /Clave\s+([0-9A-Z-]+)/g;
const keys = [];
while ((match = keyRegex.exec(content)) !== null) {
    keys.push({
        key: match[1],
        index: match.index
    });
}

// Special case for lists of keys (e.g. lipsticks, makeup shades)
// They appear as sequences of 5 digit numbers separated by spaces/newlines
const multikeyRegex = /(\d{5}[-A-Z0-9]*\s+){2,}\d{5}[-A-Z0-9]*/g;
let m;
while ((m = multikeyRegex.exec(content)) !== null) {
    const block = m[0];
    const foundKeys = block.match(/\d{5}[-A-Z0-9]*/g);

    // Find closest price strictly BEFORE this block
    const relevantPrice = prices.filter(p => p.index < m.index).pop();

    if (relevantPrice && (m.index - relevantPrice.index) < 2000) {
        foundKeys.forEach(k => {
            keyPriceMap[k] = relevantPrice.price;
        });
    }
}


// Matching keys to prices
// For each key, find the price that is closest strictly BEFORE it.
// Threshold: The price shouldn't be too far away (e.g. 2000 chars).
keys.forEach(k => {
    // Find closest price before
    const relevantPrice = prices.filter(p => p.index < k.index).pop(); // Last one in the list that is before k.index

    if (relevantPrice) {
        // Distance check? 
        if ((k.index - relevantPrice.index) < 1500) {
            keyPriceMap[k.key] = relevantPrice.price;
        }
    }
});

// Manual corrections based on user request if regex fails
// 28003 -> 400
// 28004 -> 400
// Clave 21063 -> 430
// Clave 23087 -> 360

console.log(JSON.stringify(keyPriceMap, null, 2));
