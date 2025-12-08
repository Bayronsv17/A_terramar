const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'folleto_de_mes.csv');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const priceMap = {};

let pendingOriginalPrice = null;
let captureKeys = false;

// Regex to find "de $X"
const deRegex = /de\s*\$([\d,]+\.?\d*)/;
// Regex to find "Clave X" or just "X" if we are in capture mode.
const claveRegex = /Clave\s*([0-9A-Z-]+)/;
// Regex for list of codes like "23082   23083"
const codesRegex = /\b(\d{5}[-A-Z]*)\b/g;

// We will iterate lines. 
// If we find "de $X", we store X.
// Then we look for Claves in subsequent lines.
// We reset when we hit a new "de $X" or a clear break? 
// The layout is tricky. Claves sometimes come long after the price.

// Strategy 2: Sliding window or context.
// Actually, let's look for "Clave X" and then look BACKWARDS for the nearest "de $X".
// But sometimes multiple keys share one price block.

const extracted = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for "de $X"
    const deMatch = line.match(deRegex);
    if (deMatch) {
        pendingOriginalPrice = parseFloat(deMatch[1].replace(/,/g, ''));
    }

    // Check for Clave(s)
    // Sometimes explicit "Clave X"
    let match;
    while ((match = claveRegex.exec(line)) !== null) {
        if (pendingOriginalPrice) {
            priceMap[match[1]] = pendingOriginalPrice;
        }
        // remove the match to find next
        line.replace(match[0], '');
    }

    // Sometimes formatting is:
    // 23082 23083 23084
    // ...
    // de $600 a ...
    // This implies determining direction is hard.
}

// Let's try a regex for the whole text content, finding (de $P1 ... Clave C1) pairs.
// But the distance varies.

// Let's refine the script to just look for "Clave X" lines and search upwards 20 lines for "de $Y".
// If found, assume connection.

const keysFound = [];
const text = content;

// Find all indices of "Clave" or 5-digit patterns?
// "Clave 21063" is clear.
// But "23082" on line 47 is just a number.

// Let's stick to "Clave" keyword for high confidence first.
const regexClave = /Clave\s+([0-9A-Z-]+)/g;
let m;

while ((m = regexClave.exec(text)) !== null) {
    const key = m[1];
    const index = m.index;

    // Look backwards for "de $"
    const lookback = text.substring(Math.max(0, index - 500), index);
    const deMatches = [...lookback.matchAll(/de\s*\$([\d,]+\.?\d*)/g)];

    if (deMatches.length > 0) {
        // Take the last one (nearest)
        const priceStr = deMatches[deMatches.length - 1][1];
        const originalPrice = parseFloat(priceStr.replace(/,/g, ''));
        priceMap[key] = originalPrice;
    }
}

// Special case for the group at the top (Star Glow)
// "23082   23083    23084"
// "de $600" is above them.
if (content.includes('23082') && content.includes('600.00')) {
    priceMap['23082'] = 600;
    priceMap['23083'] = 600;
    priceMap['23084'] = 600;
}

// Output the map
console.log(JSON.stringify(priceMap, null, 2));
