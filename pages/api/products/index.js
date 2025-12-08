import dbConnect from '../../../lib/dbConnect'
import Product from '../../../models/Product'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect()

    switch (method) {
        case 'GET':
            try {
                const { key } = req.query
                const query = key ? { key } : {}
                const products = await Product.find(query)
                res.status(200).json({ success: true, data: products })
            } catch (error) {
                res.status(400).json({ success: false })
            }
            break
        case 'POST':
            try {
                const product = await Product.create(req.body) /* create a new model in the database */
                res.status(201).json({ success: true, data: product })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break
        case 'DELETE':
            try {
                const { id } = req.query
                if (!id) {
                    return res.status(400).json({ success: false, message: 'Product ID is required' })
                }
                const deletedProduct = await Product.findByIdAndDelete(id)
                if (!deletedProduct) {
                    return res.status(404).json({ success: false, message: 'Product not found' })
                }
                res.status(200).json({ success: true, data: deletedProduct })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break
        default:
            res.status(400).json({ success: false })
            break
    }
}
