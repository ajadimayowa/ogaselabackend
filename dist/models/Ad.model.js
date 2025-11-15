"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const adSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, minlength: 10 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: false }, // main product thumbnail
    images: {
        type: [String],
        validate: [(arr) => arr.length <= 5, "Max 5 images allowed"],
    },
    sellerName: { type: String, required: true }, // for display
    reviewCount: { type: Number, default: 0 },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category" },
    condition: { type: String, enum: ["new", "used"], required: true },
    location: {
        state: { type: String },
        city: { type: String },
        address: { type: String },
    },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    isSold: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    adminReviewed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }, // default changed
    promotionType: {
        plan: {
            type: String,
            enum: ["free", "basic", "standard", "premium"],
            default: "basic",
        },
        price: { type: Number, required: true, default: 0 },
        durationInDays: { type: Number, default: 7 },
        startDate: { type: Date, default: null }, // 🚨 no auto-start
        endDate: { type: Date, default: null }, // 🚨 no auto-end
        paymentCompleted: { type: Boolean, default: false },
        paymentReference: { type: String },
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        },
    },
});
// 🔹 Promotion Pricing Logic
const PROMOTION_PRICING = {
    free: { price: 0, durationInDays: 7 },
    basic: { price: 3000, durationInDays: 14 },
    standard: { price: 10000, durationInDays: 31 },
    premium: { price: 50000, durationInDays: 60 },
};
// 🔸 Pre-save hook to auto-assign promo details
adSchema.pre("save", function (next) {
    const ad = this;
    const promo = PROMOTION_PRICING[ad.promotionType.plan];
    if (promo) {
        ad.promotionType.price = promo.price;
        ad.promotionType.durationInDays = promo.durationInDays;
    }
    next();
});
// 🧠 Auto-update seller status once they post their first ad
adSchema.post("save", function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        const User = mongoose_1.default.model("User");
        const seller = yield User.findById(doc.seller);
        if (seller && !seller.isSeller) {
            seller.isSeller = true;
            yield seller.save();
        }
    });
});
exports.default = mongoose_1.default.model("Ad", adSchema);
