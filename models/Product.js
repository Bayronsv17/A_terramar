import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'La clave del producto es obligatoria'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
    },
    variant: {
        type: String,
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
    },
    originalPrice: {
        type: Number,
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
    prices: {
        MX: {
            price: Number,
            originalPrice: Number,
        },
        US: {
            price: Number,
            originalPrice: Number,
        }
    }
})

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
