import dbConnect from '../../lib/dbConnect'

export default async function handler(req, res) {
    try {
        await dbConnect()
        res.status(200).json({ status: 'Connected to DB' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
