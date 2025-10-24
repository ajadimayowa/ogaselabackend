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
exports.getHomePage = void 0;
const Category_model_1 = __importDefault(require("../../models/Category.model"));
const Slider_model_1 = __importDefault(require("../../models/Slider.model"));
const User_model_1 = __importDefault(require("../../models/User.model"));
const Ad_model_1 = __importDefault(require("../../models/Ad.model"));
const getHomePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1️⃣ Fetch home slider objects (active banners)
        const homeSliderObjects = yield Slider_model_1.default.find({ isActive: true })
            .sort({ order: 1 }) // optional ordering field
            .limit(8);
        // 2️⃣ Fetch categories (you can choose to show only top/featured categories)
        const categories = yield Category_model_1.default.find({ isActive: true })
            .select("name slug image id")
            .sort({ createdAt: -1 })
            .limit(8);
        const recentlyPosted = yield Ad_model_1.default.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(8);
        // .select("storeName rating profilePic");
        // 3️⃣ Fetch top-rated sellers
        const topRatedSellers = yield Ad_model_1.default.find({ isActive: true })
            .sort({ views: -1 })
            .limit(8);
        // 4️⃣ Fetch best sellers (based on sales count or performance)
        const bestSellers = yield User_model_1.default.find({ isActive: true })
            .sort({ totalSales: -1 })
            .limit(10)
            .select("storeName totalSales profilePic");
        res.status(200).json({
            message: "Homepage data fetched successfully",
            payload: {
                homeSliderObjects,
                categories,
                recentlyPosted,
                topRatedSellers,
                bestSellers,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching homepage data", error });
    }
});
exports.getHomePage = getHomePage;
