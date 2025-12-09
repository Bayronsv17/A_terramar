import dbConnect from '../../../lib/dbConnect'
import Order from '../../../models/Order'
import Setting from '../../../models/Setting'
import Product from '../../../models/Product'
import { verifyAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect()

    switch (method) {
        case 'GET':
            try {
                const { clientName } = req.query

                let orders
                if (clientName) {
                    // Client view: specific client, full history
                    // Open for now (or could verify token matches name but simple approach is ok for reading own by name locally stored)
                    orders = await Order.find({ clientName }).populate('items.product').sort({ createdAt: -1 })
                } else {
                    // Admin view: all orders - PROTECT THIS
                    verifyAdmin(req)
                    orders = await Order.find({}).populate('items.product').sort({ createdAt: -1 }).limit(50)
                }

                res.status(200).json({ success: true, data: orders })
            } catch (error) {
                console.error('API Orders GET Error:', error)
                const s = error.message.includes('No autorizado') ? 401 : 400
                res.status(s).json({ success: false, error: error.message })
            }
            break

        case 'POST':
            try {
                // Fetch all settings to ensure we find the catalog name
                const allSettings = await Setting.find({})
                const catalogSetting = allSettings.find(s => s.key === 'currentCatalogName')
                const currentCatalogName = (catalogSetting && catalogSetting.value) ? catalogSetting.value : 'General'

                // HOTFIX: Ensure schema has the path in dev mode if cached
                if (Order.schema && !Order.schema.path('catalogName')) {
                    Order.schema.add({ catalogName: { type: String, default: 'General' } })
                }

                const orderData = {
                    ...req.body,
                    catalogName: currentCatalogName
                }

                const order = await Order.create(orderData)
                res.status(201).json({ success: true, data: order })
            } catch (error) {
                console.error('API Orders POST Error:', error)
                res.status(400).json({ success: false, error: error.message })
            }
            break

        case 'PUT':
            try {
                verifyAdmin(req) // PROTECTED
                const { orderId, status } = req.body
                if (!orderId || !status) {
                    return res.status(400).json({ success: false, error: 'Faltan datos (orderId o status)' })
                }
                const updatedOrder = await Order.findByIdAndUpdate(
                    orderId,
                    { status },
                    { new: true }
                )
                if (!updatedOrder) {
                    return res.status(404).json({ success: false, error: 'Pedido no encontrado' })
                }
                res.status(200).json({ success: true, data: updatedOrder })
            } catch (error) {
                console.error('API Orders PUT Error:', error)
                const s = error.message.includes('No autorizado') ? 401 : 400
                res.status(s).json({ success: false, error: error.message })
            }
            break

        default:
            res.status(400).json({ success: false })
            break
    }
}
