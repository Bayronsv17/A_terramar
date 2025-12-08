import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }

    try {
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const form = new IncomingForm({
            uploadDir: uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            filename: (name, ext, part, form) => {
                const timestamp = Date.now()
                const safeName = part.originalFilename.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
                return `${timestamp}-${safeName}`
            }
        })

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err)
                return res.status(500).json({ success: false, error: 'Error al procesar archivo' })
            }

            // Formidable v3 structure: files.file might be array
            const file = Array.isArray(files.file) ? files.file[0] : files.file

            if (!file) {
                return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' })
            }

            const url = `/uploads/${file.newFilename}`
            res.status(200).json({ success: true, url })
        })

    } catch (error) {
        console.error('Upload handler error:', error)
        res.status(500).json({ success: false, error: error.message })
    }
}
