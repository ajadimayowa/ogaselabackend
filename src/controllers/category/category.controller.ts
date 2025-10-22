import { Request, Response } from "express";
import Category from "../../models/Category.model";

// Create Category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name,slug, description, parentCategory, image } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      res.status(400).json({ message: "Category already exists" });
      return;
    }

    const category = new Category({
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
      image,
    });

    const saved = await category.save();
    res.status(201).json({ message: "Category created successfully", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

// Get All Categories (with optional parent filtering)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, page = 1, limit = 10, parentId } = req.query;

    const query: any = {};

    // Filter by ID
    if (id) query._id = id;

    // Search by name (case-insensitive)
    if (name) query.name = { $regex: name, $options: "i" };

    // Filter by parent category
    if (parentId) query.parentCategory = parentId;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const total = await Category.countDocuments(query);

    // Fetch paginated categories
    const categories = await Category.find(query)
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
      payload: {success:true,data:categories},
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Get Single Category
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id).populate("parentCategory", "name slug");
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json({ message: "Category retrieved", data: category });
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image, isActive, parentCategory } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (image) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (parentCategory) category.parentCategory = parentCategory;

    const updated = await category.save();
    res.status(200).json({ message: "Category updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};