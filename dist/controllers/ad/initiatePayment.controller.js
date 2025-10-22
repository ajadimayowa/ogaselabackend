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
exports.initiateAdPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
// Define price list with explicit typing
const promotionPrices = {
    free: 0,
    basic: 500,
    standard: 1000,
    premium: 2000,
};
const initiateAdPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { email, promotionPlan } = req.body;
        // Validate promotion type
        if (!promotionPlan || !(promotionPlan in promotionPrices)) {
            return res.status(400).json({ message: "Invalid promotion plan" });
        }
        const amount = promotionPrices[promotionPlan];
        // If plan is free, skip Paystack
        if (promotionPlan === "free") {
            return res.status(200).json({
                message: "Free plan selected, no payment required",
                paymentRequired: false,
            });
        }
        // Initialize Paystack payment
        const response = yield axios_1.default.post("https://api.paystack.co/transaction/initialize", {
            email,
            amount: amount * 100, // Paystack uses kobo
            metadata: { promotionPlan },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                "Content-Type": "application/json",
            },
        });
        const { authorization_url, reference } = response.data.data;
        return res.status(200).json({
            message: "Payment initialized successfully",
            paymentRequired: true,
            authorizationUrl: authorization_url,
            reference,
        });
    }
    catch (error) {
        console.error("Paystack Init Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return res.status(500).json({
            message: "Error initializing payment",
            error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message,
        });
    }
});
exports.initiateAdPayment = initiateAdPayment;
