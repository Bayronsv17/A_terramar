const mongoose = require('mongoose')

const ContactSubmissionSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
    },
    lastName: {
        type: String,
        required: [true, 'Los apellidos son obligatorios'],
    },
    birthDate: {
        type: String, // Stored as YYYY-MM-DD from form input type="date"
        required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
    },
    address: {
        type: String,
        required: [true, 'El domicilio es obligatorio'],
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'completed', 'spam'],
        default: 'new',
    },
    processedBy: {
        type: String, // Name of admin who processed it
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
})

module.exports = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', ContactSubmissionSchema)
