import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
    },
    role: {
        type: String,
        enum: ['admin', 'client'],
        default: 'client',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    region: {
        type: String,
        enum: ['MX', 'US'],
        default: 'MX',
    },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
