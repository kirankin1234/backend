const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true }, // This can now hold HTML content
    image: { type: String },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;