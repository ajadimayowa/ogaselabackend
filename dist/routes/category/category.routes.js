"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import {
// } from "..//controllers/category.controller";
const category_controller_1 = require("../../controllers/category/category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/category", auth_middleware_1.isCreator, category_controller_1.createCategory);
router.get("/categories", auth_middleware_1.isCreator, category_controller_1.getCategories);
router.get("/category/:id", auth_middleware_1.isCreator, category_controller_1.getCategoryById);
router.put("/category/:id", auth_middleware_1.isCreator, category_controller_1.updateCategory);
router.delete("/category/:id", auth_middleware_1.isCreator, category_controller_1.deleteCategory);
exports.default = router;
