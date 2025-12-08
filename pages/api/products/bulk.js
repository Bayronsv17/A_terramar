import dbConnect from '../../../lib/dbConnect'
import Product from '../../../models/Product'

export default async function handler(req, res) {
    const { method } = req
    await dbConnect()

    if (method === 'POST') {
        const { action, products } = req.body

        try {
            // ACTION: RESET DISCOUNTS (Prepare for new season)
            if (action === 'reset_discounts') {
                // Find all products
                const allProducts = await Product.find({})

                let count = 0
                for (const p of allProducts) {
                    let modified = false

                    // Reset MX
                    if (p.prices && p.prices.MX && p.prices.MX.originalPrice) {
                        p.prices.MX.price = p.prices.MX.originalPrice
                        modified = true
                    } else if (p.originalPrice) {
                        // Fallback logic
                        if (!p.prices) p.prices = {}
                        p.prices.MX = {
                            originalPrice: p.originalPrice,
                            price: p.originalPrice
                        }
                        modified = true
                    }

                    // Reset US
                    if (p.prices && p.prices.US && p.prices.US.originalPrice) {
                        p.prices.US.price = p.prices.US.originalPrice
                        modified = true
                    }

                    if (modified) {
                        p.markModified('prices')
                        await p.save()
                        count++
                    }
                }

                return res.status(200).json({ success: true, message: `Se restablecieron los precios base de ${count} productos.` })
            }

            // ACTION: BULK IMPORT (Upsert)
            if (action === 'import') {
                if (!Array.isArray(products) || products.length === 0) {
                    return res.status(400).json({ success: false, message: 'No hay productos para importar' })
                }

                let created = 0
                let updated = 0

                for (const item of products) {
                    // Normalize data
                    const key = String(item.clave).trim()
                    if (!key) continue

                    // Calculate Final Prices
                    const mxOrig = Number(item.precio_mx) || 0
                    const mxDesc = Number(item.desc_mx) || 0
                    const mxFinal = mxOrig * (1 - (mxDesc / 100))

                    const usOrig = Number(item.precio_us) || 0
                    const usDesc = Number(item.desc_us) || 0
                    const usFinal = usOrig * (1 - (usDesc / 100))

                    // Build Update Object
                    const updateData = {
                        name: item.nombre,
                        category: item.categoria || 'General',
                        // Store root fields for backward compatibility/default
                        price: mxFinal,
                        originalPrice: mxOrig,
                        key: key,
                        // Nested Prices (The Source of Truth)
                        prices: {
                            MX: {
                                originalPrice: mxOrig,
                                price: Number(mxFinal.toFixed(2))
                            },
                            US: {
                                originalPrice: usOrig,
                                price: Number(usFinal.toFixed(2))
                            }
                        }
                    }

                    if (item.imagen) updateData.image = item.imagen
                    if (item.variante) updateData.variant = item.variante

                    // Upsert (Update if exists, Create if not)
                    const result = await Product.findOneAndUpdate(
                        { key: key },
                        { $set: updateData },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    )

                    // Check if it was a new doc (createdAt approx now) or we can assume based on result
                    // Mongoose findOneAndUpdate doesn't easily return "created vs updated" boolean in one go without raw result
                    // We'll just count total processed for now vs errors
                    updated++
                }

                return res.status(200).json({ success: true, message: `Proceso completado. ${updated} productos procesados.` })
            }

            return res.status(400).json({ success: false, message: 'Acción no válida' })

        } catch (error) {
            console.error('Bulk Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' })
    }
}
