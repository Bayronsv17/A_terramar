import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
    },
    clientPhone: {
        type: String,
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            priceAtOrder: {
                type: Number,
                required: true,
            },
            // Snapshot fields in case product is deleted
            name: String,
            key: String,
            image: String
        }
    ],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Confirmado', 'Entregado', 'Cancelado'],
        default: 'Pendiente',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    catalogName: {
        type: String, // e.g. "Diciembre 2025" or "Enero 2026"
        default: 'General'
    }
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
