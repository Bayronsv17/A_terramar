import dbConnect from '../../../lib/dbConnect'
import Product from '../../../models/Product'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect()

    if (method === 'POST') {
        try {
            const { key, pricesMX, pricesUS, isVisibleMX, isVisibleUS, image } = req.body

            if (!key) {
                return res.status(400).json({ success: false, message: 'Key is required' })
            }

            // Build update object dynamically
            const updateData = {}

            if (image) updateData['image'] = image

            // --- Update MX Prices ---
            if (pricesMX) {
                updateData['prices.MX.originalPrice'] = Number(pricesMX.originalPrice)
                updateData['prices.MX.price'] = Number(pricesMX.price)

                // BACKWARD COMPATIBILITY
                updateData['originalPrice'] = Number(pricesMX.originalPrice)
                updateData['price'] = Number(pricesMX.price)
            }

            // --- Update US Prices ---
            if (pricesUS) {
                updateData['prices.US.originalPrice'] = Number(pricesUS.originalPrice)
                updateData['prices.US.price'] = Number(pricesUS.price)
            }

            // --- Update Visibility ---
            if (typeof isVisibleMX !== 'undefined') updateData['isVisibleMX'] = isVisibleMX
            if (typeof isVisibleUS !== 'undefined') updateData['isVisibleUS'] = isVisibleUS

            // Use findOneAndUpdate to ensure fields are added even if schema was cached without them
            const product = await Product.findOneAndUpdate(
                { key },
                { $set: updateData },
                { new: true, runValidators: true }
            )

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' })
            }

            res.status(200).json({ success: true, data: product })
        } catch (error) {
            console.error('Update Price Error:', error)
            res.status(400).json({ success: false, message: error.message || 'Error desconocido en servidor' })
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' })
    }
}
