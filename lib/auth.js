import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'alma_terramar_secure_jwt_secret_2024_key_change_me'

/**
 * Middleware de seguridad para validar que el usuario sea administrador.
 * Si la verificación falla, lanza un error que debe ser capturado.
 */
export function verifyAdmin(req) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Missing or invalid Authorization header')
        throw new Error('No autorizado: Token faltante')
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        // Verificamos explícitamente el rol de admin
        if (decoded.role !== 'admin') {
            console.error(`User ${decoded.userId} attempted admin action but has role ${decoded.role}`)
            throw new Error('No autorizado: Permisos insuficientes')
        }
        return decoded
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado: Inicia sesión nuevamente')
        }
        console.error('Token verification failed:', error.message)
        throw new Error('No autorizado: Token inválido')
    }
}
