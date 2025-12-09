import dbConnect from '../../../lib/dbConnect'
import ContactSubmission from '../../../models/ContactSubmission'
import { verifyAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
    await dbConnect()

    try {
        // PROTEGER TODAS LAS RUTAS DE ESTE ARCHIVO (SOLO ADMIN)
        verifyAdmin(req)

        if (req.method === 'GET') {
            const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 })
            return res.status(200).json({ success: true, data: submissions })
        }

        if (req.method === 'DELETE') {
            const { id } = req.query
            if (!id) return res.status(400).json({ success: false, error: 'ID required' })
            await ContactSubmission.findByIdAndDelete(id)
            return res.status(200).json({ success: true })
        }

        if (req.method === 'PATCH') {
            const { id, status } = req.body
            if (!id) return res.status(400).json({ success: false, error: 'ID required' })
            const updated = await ContactSubmission.findByIdAndUpdate(id, { status }, { new: true })
            return res.status(200).json({ success: true, data: updated })
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        // Si verifyAdmin falla o cualquier otro error
        const msg = error.message
        const status = msg.includes('No autorizado') || msg.includes('Token') ? 401 : 400
        return res.status(status).json({ success: false, error: msg })
    }
}
