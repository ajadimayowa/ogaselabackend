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
exports.activateAd = void 0;
const Ad_model_1 = __importDefault(require("../../../models/Ad.model"));
const activateAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ad = yield Ad_model_1.default.findById(id);
        if (!ad) {
            return res.status(404).json({ success: false, message: "Ad not found" });
        }
        // Check both conditions
        if (ad.adminReviewed) {
            return res.status(400).json({ success: false, message: "Admin already reviewed!" });
        }
        if (!ad.promotionType.paymentCompleted) {
            return res.status(400).json({
                success: false,
                message: "Payment not completed",
            });
        }
        const duration = ad.promotionType.durationInDays || 0;
        // Activate the ad now
        const now = new Date();
        ad.isActive = true;
        ad.promotionType.startDate = now;
        ad.promotionType.endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
        yield ad.save();
        res.json({
            success: true,
            message: "Ad activated successfully",
            data: ad,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.activateAd = activateAd;
