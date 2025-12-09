import dbConnect from '../../../lib/dbConnect'
import ContactSubmission from '../../../models/ContactSubmission'

export default async function handler(req, res) {
    await dbConnect()

    if (req.method === 'GET') {
        try {
            const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 })
            return res.status(200).json({ success: true, data: submissions })
        } catch (error) {
            return res.status(400).json({ success: false, error: error.message })
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query
            if (!id) return res.status(400).json({ success: false, error: 'ID required' })
            await ContactSubmission.findByIdAndDelete(id)
            return res.status(200).json({ success: true })
        } catch (error) {
            return res.status(400).json({ success: false, error: error.message })
        }
    }

    if (req.method === 'PATCH') {
        try {
            const { id, status } = req.body
            if (!id) return res.status(400).json({ success: false, error: 'ID required' })
            const updated = await ContactSubmission.findByIdAndUpdate(id, { status }, { new: true })
            return res.status(200).json({ success: true, data: updated })
        } catch (error) {
            return res.status(400).json({ success: false, error: error.message })
        }
    }

    res.status(405).json({ error: 'Method not allowed' })
}
