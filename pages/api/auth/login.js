import dbConnect from '../../../lib/dbConnect'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    await dbConnect()

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' })
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                region: user.region
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}
