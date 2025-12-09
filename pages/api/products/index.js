import dbConnect from '../../../lib/dbConnect'
import Product from '../../../models/Product'
import { verifyAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect()

    switch (method) {
        case 'GET':
            try {
                const { key, page = 1, limit = 50, category, region } = req.query

                // If searching by specific key, ignore pagination to ensure we find it
                if (key) {
                    const query = { key: new RegExp(`^${key}$`, 'i') } // Exact match case insensitive
                    const products = await Product.find(query)
                    return res.status(200).json({ success: true, data: products, pagination: { total: products.length, page: 1, totalPages: 1 } })
                }

                const pageInt = parseInt(page)
                const limitInt = parseInt(limit)
                const skip = (pageInt - 1) * limitInt

                let query = {}

                // Filter by Category
                if (category && category !== 'Todas') {
                    query.category = category
                }

                // Filter by Region Visibility
                if (region === 'MX') {
                    query.isVisibleMX = { $ne: false }
                } else if (region === 'US') {
                    query.isVisibleUS = { $ne: false }
                }

                // Get Total Count
                const total = await Product.countDocuments(query)
                const totalPages = Math.ceil(total / limitInt)

                // Get Products with specific sorting
                // We sort by Category first to keep them grouped, then by Key
                const products = await Product.find(query)
                    .sort({ category: 1, key: 1 })
                    .skip(skip)
                    .limit(limitInt)

                // Get All Unique Categories for the filter dropdown
                // We assume categories don't change often, so fetching distinct is fine
                const categories = await Product.distinct('category')

                res.status(200).json({
                    success: true,
                    data: products,
                    pagination: {
                        total,
                        page: pageInt,
                        limit: limitInt,
                        totalPages
                    },
                    categories: ['Todas', ...categories.sort()]
                })
            } catch (error) {
                console.error('API Error:', error)
                res.status(400).json({ success: false, error: error.message })
            }
            break
        case 'POST':
            try {
                verifyAdmin(req) // PROTECTED
                const product = await Product.create(req.body) /* create a new model in the database */
                res.status(201).json({ success: true, data: product })
            } catch (error) {
                const s = error.message.includes('No autorizado') ? 401 : 400
                res.status(s).json({ success: false, error: error.message })
            }
            break
        case 'DELETE':
            try {
                verifyAdmin(req) // PROTECTED
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
                const s = error.message.includes('No autorizado') ? 401 : 400
                res.status(s).json({ success: false, error: error.message })
            }
            break
        default:
            res.status(400).json({ success: false })
            break
    }
}
