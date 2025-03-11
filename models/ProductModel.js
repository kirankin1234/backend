// Using CommonJS
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
    productName: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, required: true } // Only stores filename (e.g., "987654321.png")
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);