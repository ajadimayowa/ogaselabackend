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
exports.getActiveHomeSliders = exports.deleteHomeSlider = exports.updateHomeSlider = exports.getHomeSliderById = exports.getAllHomeSliders = exports.createHomeSlider = void 0;
const Slider_model_1 = __importDefault(require("../../models/Slider.model"));
// ✅ Create a new slider
const createHomeSlider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, subtitle, image, category, buttonText, buttonLink, isActive, order } = req.body;
        const newSlider = yield Slider_model_1.default.create({
            title,
            subtitle,
            image,
            buttonText,
            buttonLink,
            isActive,
            category,
            order,
        });
        return res.status(201).json({
            success: true,
            message: "Slider created successfully",
            data: newSlider,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create slider",
        });
    }
});
exports.createHomeSlider = createHomeSlider;
// ✅ Get all sliders (with optional query filters)
const getAllHomeSliders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { active } = req.query;
        let query = {};
        if (active === "true")
            query.isActive = true;
        if (active === "false")
            query.isActive = false;
        const sliders = yield Slider_model_1.default.find(query).sort({ order: 1 });
        return res.status(200).json({
            success: true,
            message: "Sliders fetched successfully",
            count: sliders.length,
            payload: sliders,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch sliders",
        });
    }
});
exports.getAllHomeSliders = getAllHomeSliders;
// ✅ Get a single slider by ID
const getHomeSliderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const slider = yield Slider_model_1.default.findById(id);
        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: slider,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch slider",
        });
    }
});
exports.getHomeSliderById = getHomeSliderById;
// ✅ Update a slider
const updateHomeSlider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedSlider = yield Slider_model_1.default.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
        if (!updatedSlider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Slider updated successfully",
            data: updatedSlider,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update slider",
        });
    }
});
exports.updateHomeSlider = updateHomeSlider;
// ✅ Delete a slider
const deleteHomeSlider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedSlider = yield Slider_model_1.default.findByIdAndDelete(id);
        if (!deletedSlider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Slider deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete slider",
        });
    }
});
exports.deleteHomeSlider = deleteHomeSlider;
// ✅ Get only active sliders (for homepage)
const getActiveHomeSliders = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sliders = yield Slider_model_1.default.find({ isActive: true }).sort({ order: 1 });
        return res.status(200).json({
            success: true,
            message: "Active sliders fetched successfully",
            data: sliders,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch active sliders",
        });
    }
});
exports.getActiveHomeSliders = getActiveHomeSliders;
