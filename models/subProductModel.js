const mongoose = require("mongoose");

const subProductSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    height: { type: Number, default: null },
    width: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model("SubProduct", subProductSchema);