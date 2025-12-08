import dbConnect from '../../../lib/dbConnect'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { name, email, password, region } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' })
    }

    await dbConnect()

    try {
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'El correo ya está registrado' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'client', // Default role
            region: region || 'MX'
        })

        // Auto login after signup
        const token = jwt.sign(
            { userId: user._id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({
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
