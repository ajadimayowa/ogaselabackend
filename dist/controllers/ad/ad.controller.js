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
exports.updatePromotionPayment = exports.deleteAd = exports.updateAd = exports.getAdById = exports.getAds = exports.createAd = void 0;
const Ad_model_1 = __importDefault(require("../../models/Ad.model"));
const axios_1 = __importDefault(require("axios"));
/**
 * @desc Create a new ad
 * @route POST /api/ads
 */
const createAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = req.files;
        const { title, description, price, sellerName, reviewCount, category, subCategory, condition, state, city, location, seller, promotionPlan, paymentReference, } = req.body;
        if (!title || !description || !price || !condition || !seller || !category || !promotionPlan) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        const validPromotionPlans = ["free", "basic", "standard", "premium"];
        if (!validPromotionPlans.includes(promotionPlan)) {
            res.status(400).json({ success: false, message: "Invalid promotion plan" });
            return;
        }
        // Payment logic
        const paymentCompleted = promotionPlan === "free";
        const newAd = yield Ad_model_1.default.create({
            title,
            description,
            price,
            images: images.map((img) => img === null || img === void 0 ? void 0 : img.location),
            sellerName,
            reviewCount,
            category,
            subCategory,
            condition,
            location: {
                state,
                city,
                address: location,
            },
            seller,
            // 🚨 Ads are inactive until admin + payment
            isActive: false,
            adminReviewed: false,
            promotionType: {
                plan: promotionPlan,
                paymentCompleted,
                paymentReference: paymentReference || null,
                startDate: null,
                endDate: null,
            },
        });
        res.status(201).json({
            success: true,
            message: paymentCompleted
                ? "Ad created successfully. Awaiting admin review."
                : "Ad created successfully. Awaiting payment & admin review.",
            data: newAd,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating ad",
            error: error.message,
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
        const { page = 1, limit = 10, search = "", category, seller, sortBy = "createdAt", order = "desc", isActive, isPaymentCompleted, // 👈 NEW
         } = req.query;
        const query = {};
        // ⭐ DEFAULT BEHAVIOUR → Only active ads
        if (isActive === "true")
            query.isActive = true;
        else if (isActive === "false")
            query.isActive = false;
        else
            query.isActive = true; // default
        // ⭐ Filter by Payment Completed
        if (isPaymentCompleted === "true") {
            query["promotionType.paymentCompleted"] = true;
        }
        else if (isPaymentCompleted === "false") {
            query["promotionType.paymentCompleted"] = false;
        }
        // 🔍 Search by title or seller name
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { "seller.profile.fullName": { $regex: search, $options: "i" } },
            ];
        }
        if (category)
            query.category = category;
        if (seller)
            query.seller = seller;
        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        if (sortBy === "price")
            sortOptions.price = order === "asc" ? 1 : -1;
        else if (sortBy === "city")
            sortOptions["location.city"] = order === "asc" ? 1 : -1;
        else
            sortOptions.createdAt = order === "asc" ? 1 : -1;
        // 🧮 Total count
        const totalAds = yield Ad_model_1.default.countDocuments(query);
        // 🧾 Fetch ads
        const ads = yield Ad_model_1.default.find(query)
            .populate("category", "name")
            .populate("seller", "profile.fullName profile.profilePicUrl")
            .sort(sortOptions)
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
        console.error(error);
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
            .populate("seller", "profile.fullName profile.profilePicUrl storeName rating totalSales contact.phoneNumber");
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
const updatePromotionPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { adId, reference } = req.body;
        if (!adId || !reference) {
            return res.status(400).json({
                message: "adId and reference are required",
            });
        }
        const ad = yield Ad_model_1.default.findById(adId);
        if (!ad) {
            return res.status(404).json({ message: "Ad not found" });
        }
        // 🔍 1. VERIFY PAYMENT WITH PAYSTACK
        const paystackRes = yield axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            },
        });
        const verification = paystackRes.data;
        if (!verification.status || verification.data.status !== "success") {
            return res.status(400).json({
                success: false,
                message: "Payment not verified",
                paystackResponse: verification,
            });
        }
        // Optional validation: Ensure amount matches expected price
        const paidAmount = verification.data.amount / 100; // Paystack stores in kobo
        const expectedAmount = ad.promotionType.price;
        if (paidAmount < expectedAmount) {
            return res.status(400).json({
                success: false,
                message: "Incorrect amount paid. Payment rejected.",
                expectedAmount,
                paidAmount,
            });
        }
        // 🔐 2. SAVE payment as verified
        ad.promotionType.paymentCompleted = true;
        ad.promotionType.paymentReference = reference;
        yield ad.save();
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully. Awaiting admin review.",
            payload: ad,
        });
    }
    catch (error) {
        console.error("PAYMENT VERIFY ERROR:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
        return res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message,
        });
    }
});
exports.updatePromotionPayment = updatePromotionPayment;
