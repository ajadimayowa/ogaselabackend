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
exports.deleteAd = exports.updateAd = exports.getAdById = exports.getAds = exports.createAd = void 0;
const Ad_model_1 = __importDefault(require("../../models/Ad.model"));
const User_model_1 = __importDefault(require("../../models/User.model"));
const Category_model_1 = __importDefault(require("../../models/Category.model"));
/**
 * @desc Create a new ad
 * @route POST /api/ads
 */
const createAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = req.files;
        const { title, description, price, sellerName, reviewCount, category, subCategory, condition, state, city, location, seller, promotionPlan, // 👈 Added
        paymentReference, // 👈 Added (after Paystack initialization)
         } = req.body;
        // ✅ Validate required fields
        if (!title || !description || !price || !condition || !seller || !category || !promotionPlan) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        // ✅ Verify category exists
        const categoryExists = yield Category_model_1.default.findById(category);
        if (!categoryExists) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }
        // ✅ Verify seller exists
        const user = yield User_model_1.default.findById(seller);
        if (!user) {
            res.status(404).json({ success: false, message: "Seller not found" });
            return;
        }
        // ✅ Validate promotion type
        const validPromotionPlans = ["free", "basic", "standard", "premium"];
        if (!promotionPlan || !validPromotionPlans.includes(promotionPlan)) {
            res.status(400).json({ success: false, message: "Invalid or missing promotion type" });
            return;
        }
        // ✅ Set paymentCompleted based on plan type
        const paymentCompleted = promotionPlan === "free" ? true : false;
        // ✅ Create new Ad with promotion details
        const newAd = yield Ad_model_1.default.create({
            title,
            description,
            price,
            images: images.map((gig) => gig === null || gig === void 0 ? void 0 : gig.location),
            sellerName,
            reviewCount,
            category,
            subCategory,
            condition,
            location: {
                state: state,
                city: city,
                address: location
            },
            seller,
            promotionType: {
                plan: promotionPlan,
                paymentCompleted,
                paymentReference: paymentReference || null,
            },
        });
        res.status(201).json({
            success: true,
            message: paymentCompleted
                ? "Ad created successfully (Free Plan)"
                : "Ad created successfully. Awaiting payment confirmation.",
            data: newAd,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating ad",
            error: error.message || error,
        });
    }
});
exports.createAd = createAd;
/**
 * @desc Get all ads (with pagination, search, and filters)
 * @route GET /api/ads
 */
const getAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search = "", category, seller } = req.query;
        const query = {};
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }
        if (category) {
            query.category = category;
        }
        if (seller) {
            query.seller = seller;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const totalAds = yield Ad_model_1.default.countDocuments(query);
        const ads = yield Ad_model_1.default.find(query)
            .populate("category", "name")
            .populate("seller", "profile.fullName profile.profilePicUrl")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        res.status(200).json({
            success: true,
            message: "Ads fetched successfully",
            pagination: {
                total: totalAds,
                currentPage: Number(page),
                totalPages: Math.ceil(totalAds / Number(limit)),
            },
            data: ads,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching ads", error });
    }
});
exports.getAds = getAds;
/**
 * @desc Get a single ad by ID
 * @route GET /api/ads/:id
 */
const getAdById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ad = yield Ad_model_1.default.findById(id)
            .populate("category", "name")
            .populate("seller", "profile.fullName profile.profilePicUrl storeName rating totalSales");
        if (!ad) {
            res.status(404).json({ success: false, message: "Ad not found" });
            return;
        }
        // Increment view count
        ad.views += 1;
        yield ad.save();
        res.status(200).json({
            success: true,
            message: "Ad fetched successfully",
            data: ad,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching ad", error });
    }
});
exports.getAdById = getAdById;
/**
 * @desc Update ad details
 * @route PUT /api/ads/:id
 */
const updateAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedAd = yield Ad_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAd) {
            res.status(404).json({ success: false, message: "Ad not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Ad updated successfully",
            data: updatedAd,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error updating ad", error });
    }
});
exports.updateAd = updateAd;
/**
 * @desc Delete an ad
 * @route DELETE /api/ads/:id
 */
const deleteAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ad = yield Ad_model_1.default.findByIdAndDelete(id);
        if (!ad) {
            res.status(404).json({ success: false, message: "Ad not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Ad deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error deleting ad", error });
    }
});
exports.deleteAd = deleteAd;
