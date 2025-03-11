const { message } = require('statuses');
const Category = require('../models/CategoryModel');
const Subcategory = require('../models/SubcategoryModel');
const multer = require('multer');
const fs = require("fs");
const path = require("path");

// Setup Multer for handling file uploads
const upload = multer({ dest: './uploads/' }); // Adjust the destination as needed

// Add Category
exports.addCategory = async(req, res) => {
    try {
        const { name, shortDescription, detailedDescription } = req.body;
        let image = null;

        if (req.file) {
            image = req.file.filename; // Store the image file name in the database
        }

        const category = new Category({
            name,
            shortDescription,
            detailedDescription, // This can now hold HTML content
            image,
        });

        await category.save();

        res.status(201).json({ message: 'Category added successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Categories
exports.getCategories = async(req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getCategoryById = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({
            category,
            message: "Category fetch successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get Subcategories (updated as per your code)
exports.getSubcategories = async(req, res) => {
    try {
        const { category } = req.params; // categoryName from URL

        console.log("Category received from frontend:", category); // Debugging log

        // Find the category by name
        const categoryData = await Category.findOne({
            name: { $regex: new RegExp("^" + category + "$", "i") },
        });

        if (!categoryData) {
            console.log("Category not found in DB:", category); // Debugging log
            return res.status(404).json({ message: "Category not found" });
        }

        // Fetch subcategories linked to this category ID
        const subcategories = await Subcategory.find({ categoryId: categoryData._id });

        if (subcategories.length === 0) {
            return res.status(404).json({ message: "No subcategories found" });
        }

        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategories", error });
    }
};

// Controller function to delete a category
exports.deleteCategory = async(req, res) => {
    const categoryId = req.params.id;

    if (!categoryId) {
        return res.status(400).json({ error: "Category ID (_id) is required" });
    }

    try {
        // Find the category to get its image path before deletion
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Delete the image from the uploads folder if it exists
        if (category.image) {
            const imagePath = path.join(__dirname, "../uploads", category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete the category from the database
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ message: "Category and its image deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Failed to delete category" });
    }
};

// Update the category
exports.updatedCategory = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, shortDescription, detailedDescription } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id, { name, shortDescription, detailedDescription }, { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category updated successfully",
            updatedCategory,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};