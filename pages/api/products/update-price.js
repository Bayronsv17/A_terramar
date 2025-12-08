import dbConnect from '../../../lib/dbConnect'
import Product from '../../../models/Product'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect()

    if (method === 'POST') {
        try {
            const { key, pricesMX, pricesUS } = req.body

            if (!key) {
                return res.status(400).json({ success: false, message: 'Key is required' })
            }

            const product = await Product.findOne({ key })

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' })
            }

            // Ensure prices structure exists
            if (!product.prices) {
                product.prices = { MX: {}, US: {} }
            }
            if (!product.prices.MX) product.prices.MX = {}
            if (!product.prices.US) product.prices.US = {}

            // --- Update MX Prices ---
            if (pricesMX) {
                const { originalPrice, price } = pricesMX

                // Mongoose friendly update
                product.prices.MX.originalPrice = Number(originalPrice)
                product.prices.MX.price = Number(price)

                // BACKWARD COMPATIBILITY: Update root fields with MX prices
                product.originalPrice = Number(originalPrice)
                product.price = Number(price)
            }

            // --- Update US Prices ---
            if (pricesUS) {
                const { originalPrice, price } = pricesUS

                product.prices.US.originalPrice = Number(originalPrice)
                product.prices.US.price = Number(price)
            }

            // Mark modified to guarantee save of mixed/nested types if schema is loose
            product.markModified('prices')

            await product.save()

            res.status(200).json({ success: true, data: product })
        } catch (error) {
            console.error('Update Price Error:', error)
            // Return 'message' so frontend displays it correctly
            res.status(400).json({ success: false, message: error.message || 'Error desconocido en servidor' })
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' })
    }
}
