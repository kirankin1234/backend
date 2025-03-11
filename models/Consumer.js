const mongoose = require('mongoose');

const ConsumerSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (email) => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(email);
            },
            message: 'Invalid email address'
        }
    },
    password: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Consumer', ConsumerSchema);