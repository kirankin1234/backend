const Product = require("../models/ProductModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ""),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ✅ Add a Product
exports.addProduct = async(req, res) => {
    try {
        let { category, subcategory, productName, price, productCode, description, size } = req.body;

        if (!Array.isArray(size)) {
            size = typeof size === "string" ? size.split(",").map(s => s.trim()).filter(Boolean) : [];
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image upload failed" });
        }

        const newProduct = new Product({
            category,
            subcategory,
            productName,
            price,
            productCode,
            description,
            size,
            image: `/uploads/${req.file.filename}`
        });

        await newProduct.save();
        res.status(201).json({ success: true, newProduct, message: "Product added successfully" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Error adding product" });
    }
};

// ✅ Get All Products with optional filtering
exports.getProducts = async(req, res) => {
    try {
        const filter = {};
        if (req.query.categoryId) filter.category = req.query.categoryId;
        if (req.query.subcategoryId) filter.subcategory = req.query.subcategoryId;

        const products = await Product.find(filter);
        res.status(200).json({ success: true, products, message: "Products fetched successfully" });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Get Product by Subcategory ID
exports.getProductBySubId = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid Subcategory ID" });
        }

        const products = await Product.find({ subcategory: id });
        res.status(200).json({ success: true, products, message: "Products fetched successfully" });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Get Product by ID
exports.getById = async(req, res) => {
    try {
        const { productId } = req.params;
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product, message: "Product fetched successfully" });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Delete a Product
exports.deleteProduct = async(req, res) => {
    try {
        const { id } = req.params;

        // Validate Product ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        // Find the product to get its image path before deletion
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete the image if it exists
        if (product.image) {
            // Extract only the filename from "/uploads/1741251879610-707426037.jpg"
            const imageFilename = path.basename(product.image); // Extracts "1741251879610-707426037.jpg"
            const imagePath = path.join(__dirname, "../uploads", imageFilename); // Forms correct path

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete the product from the database
        await Product.findByIdAndDelete(id);

        res.status(200).json({ message: "Product and its image deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Update a Product
exports.updateProduct = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        if (req.body.size && typeof req.body.size === "string") {
            req.body.size = req.body.size.split(",").map(s => s.trim()).filter(Boolean);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ success: true, updatedProduct, message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product", error });
    }
};

// ✅ Search Products for Table View
exports.getProductsForTable = async(req, res) => {
    try {
        const filter = req.query.name ? { productName: { $regex: req.query.name, $options: "i" } } : {};
        const products = await Product.find(filter).select("productName price productCode");
        res.status(200).json({ success: true, products, message: "Products fetched successfully" });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
};


// products.controller.js
exports.searchProductsByName = async(req, res) => {
    try {
        const searchTerm = req.query.name; // Get search term from query parameter

        if (!searchTerm) {
            return res.status(400).json({ message: "Search term is required" });
        }

        // Search products by name (case-insensitive)
        const products = await Product.find({
            productName: { $regex: new RegExp(searchTerm, "i") }
        }).select("_id productName productCode price description image category subcategory");

        if (products.length === 0) {
            console.log("🟡 No products found for:", searchTerm);
            return res.status(404).json({ message: "No products found" });
        }

        console.log("✅ Products found:", products);

        res.status(200).json({
            success: true,
            products,
            message: "Products fetched successfully"
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};