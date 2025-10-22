"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const Category_model_1 = __importDefault(require("../../models/Category.model"));
// Create Category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, slug, description, parentCategory, image } = req.body;
        const existing = yield Category_model_1.default.findOne({ name });
        if (existing) {
            res.status(400).json({ message: "Category already exists" });
            return;
        }
        const category = new Category_model_1.default({
            name,
            slug,
            description,
            parentCategory: parentCategory || null,
            image,
        });
        const saved = yield category.save();
        res.status(201).json({ message: "Category created successfully", data: saved });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
});
exports.createCategory = createCategory;
// Get All Categories (with optional parent filtering)
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, page = 1, limit = 10, parentId } = req.query;
        const query = {};
        // Filter by ID
        if (id)
            query._id = id;
        // Search by name (case-insensitive)
        if (name)
            query.name = { $regex: name, $options: "i" };
        // Filter by parent category
        if (parentId)
            query.parentCategory = parentId;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Get total count for pagination metadata
        const total = yield Category_model_1.default.countDocuments(query);
        // Fetch paginated categories
        const categories = yield Category_model_1.default.find(query)
            .populate("parentCategory", "name slug")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Categories retrieved successfully",
            pagination: {
                total,
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
            payload: { success: true, data: categories },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
});
exports.getCategories = getCategories;
// Get Single Category
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_model_1.default.findById(req.params.id).populate("parentCategory", "name slug");
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json({ message: "Category retrieved", data: category });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching category", error });
    }
});
exports.getCategoryById = getCategoryById;
// Update Category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, image, isActive, parentCategory } = req.body;
        const category = yield Category_model_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        if (name)
            category.name = name;
        if (description)
            category.description = description;
        if (image)
            category.image = image;
        if (isActive !== undefined)
            category.isActive = isActive;
        if (parentCategory)
            category.parentCategory = parentCategory;
        const updated = yield category.save();
        res.status(200).json({ message: "Category updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
});
exports.updateCategory = updateCategory;
// Delete Category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_model_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
});
exports.deleteCategory = deleteCategory;
