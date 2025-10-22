import express from "express";
// import {

// } from "..//controllers/category.controller";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "../../controllers/category/category.controller";
import { isCreator } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/category",isCreator, createCategory);
router.get("/categories",isCreator,  getCategories);
router.get("/category/:id",isCreator, getCategoryById);
router.put("/category/:id",isCreator,  updateCategory);
router.delete("/category/:id",isCreator,  deleteCategory);

export default router;