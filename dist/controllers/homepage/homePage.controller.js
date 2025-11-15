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
const useConvertUserCordintates_1 = require("../../utils/useConvertUserCordintates");
// Helper function to fetch homepage data
const fetchHomepageData = (state) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ sortingBy: state });
    const homeSliderObjects = yield Slider_model_1.default.find({ isActive: true })
        .sort({ order: 1 })
        .limit(8);
    const categories = yield Category_model_1.default.find({ isActive: true })
        .select("name slug image id")
        .sort({ createdAt: -1 })
        .limit(8);
    const recentlyPosted = yield Ad_model_1.default.find({
        'location.state': state,
        isActive: true
    })
        .sort({ createdAt: -1 })
        .limit(8);
    const topRatedSellers = yield Ad_model_1.default.find({
        'location.state': state,
        isActive: true
    })
        .sort({ views: -1 })
        .limit(8);
    const bestSellers = yield User_model_1.default.find({ 'location.state': state })
        .sort({ totalSales: -1 })
        .limit(10)
        .select("storeName totalSales profilePic");
    return { homeSliderObjects, categories, recentlyPosted, topRatedSellers, bestSellers };
});
const fetchHomepageDataNoState = () => __awaiter(void 0, void 0, void 0, function* () {
    const homeSliderObjects = yield Slider_model_1.default.find({ isActive: true })
        .sort({ order: 1 })
        .limit(8);
    const categories = yield Category_model_1.default.find({ isActive: true })
        .select("name slug image id")
        .sort({ createdAt: -1 })
        .limit(8);
    const recentlyPosted = yield Ad_model_1.default.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(16);
    const topRatedSellers = yield Ad_model_1.default.find({ isActive: true })
        .sort({ views: -1 })
        .limit(16);
    const bestSellers = yield User_model_1.default.find({ isActive: true })
        .sort({ totalSales: -1 })
        .limit(16)
        .select("storeName totalSales profilePic");
    return { homeSliderObjects, categories, recentlyPosted, topRatedSellers, bestSellers };
});
const getHomePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lon } = req.query;
        //  console.log('seecord',lat,lon);
        let state = null;
        if (lat && lon && typeof lat === "string" && typeof lon === "string") {
            // Reverse geocode using Google API
            state = yield (0, useConvertUserCordintates_1.getUserAddressGoogle)(lat, lon);
            console.log({ seeState: state });
            const payload = yield fetchHomepageData(`${state} State`);
            return res.status(200).json({
                message: "Homepage data fetched successfully",
                state, // optional: include user's state if available
                payload,
            });
        }
        else {
            const payload = yield fetchHomepageDataNoState();
            return res.status(200).json({
                message: "Homepage data fetched successfully",
                state, // optional: include user's state if available
                payload,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching homepage data",
            error,
        });
    }
});
exports.getHomePage = getHomePage;
