const fs = require('fs');
const path = require('path');

// Load environment manually
try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                if (key && !key.startsWith('#')) {
                    process.env[key] = val.replace(/^["'](.*)["']$/, '$1');
                }
            }
        });
    }
} catch (e) { console.error('Env load error', e); }

const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

cloudinary.config({
    cloud_name: 'dih0cyoun',
    api_key: '756295635585731',
    api_secret: '_LmXyTxh8K1CV6sX3CRhahMDYuk'
});

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('ERROR: MONGODB_URI not found');
        process.exit(1);
    }

    console.log('Connecting to DB...');
    await mongoose.connect(uri);

    const ProductSchema = new mongoose.Schema({
        key: String,
        image: String
    }, { strict: false });

    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    console.log('Fetching images from Cloudinary (Folder: Terramar)...');

    let resources = [];
    let next_cursor = null;

    try {
        do {
            const res = await cloudinary.api.resources({
                type: 'upload',
                // prefix: 'Terramar/', 
                max_results: 500,
                next_cursor: next_cursor
            });
            resources = [...resources, ...res.resources];
            next_cursor = res.next_cursor;
            process.stdout.write('.');
        } while (next_cursor);
    } catch (e) {
        console.error('\nCloudinary Error:', e.message);
        process.exit(1);
    }

    console.log(`\nFound ${resources.length} images.`);
    if (resources.length > 0) {
        console.log('Sample public_ids:', resources.slice(0, 3).map(r => r.public_id));
    }

    const products = await Product.find({});
    console.log(`Loaded ${products.length} products.`);

    const imageMap = {};
    resources.forEach(r => {
        // Expected public_id: "Terramar/61012_mhv9am"
        const filename = r.public_id.split('/').pop();
        if (!filename) return;

        // Extract key: "61012_mhv9am" -> "61012"
        const potentialKey = filename.split('_')[0];
        imageMap[potentialKey] = r.secure_url;

        // Also map if exact match "61012" (without underscore)
        if (filename === potentialKey) imageMap[filename] = r.secure_url;
    });

    let bulkOps = [];
    for (const p of products) {
        if (!p.key) continue;
        const newUrl = imageMap[p.key];
        if (newUrl) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: p._id },
                    update: { $set: { image: newUrl } }
                }
            });
        }
    }

    if (bulkOps.length > 0) {
        console.log(`Updating ${bulkOps.length} products...`);
        await Product.bulkWrite(bulkOps);
        console.log('Success!');
    } else {
        console.log('No matches found. Check sample public_ids above.');
    }

    process.exit(0);
}

run().catch(console.error);
