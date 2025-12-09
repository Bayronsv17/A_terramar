import dbConnect from '../../../lib/dbConnect'
import Setting from '../../../models/Setting'
import { verifyAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect()

    switch (method) {
        case 'GET':
            try {
                const settings = await Setting.find({})
                // Convert array to object for easier consumption { key: value }
                const settingsObj = settings.reduce((acc, curr) => {
                    acc[curr.key] = curr.value
                    return acc
                }, {})
                res.status(200).json({ success: true, data: settingsObj })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break

        case 'POST':
            try {
                verifyAdmin(req) // PROTECTED
                // Expects body like { key: 'currentCatalogName', value: 'Enero 2024' }
                const { key, value } = req.body

                if (!key) throw new Error('Key is required')

                const setting = await Setting.findOneAndUpdate(
                    { key },
                    { value },
                    { new: true, upsert: true }
                )

                res.status(200).json({ success: true, data: setting })
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
