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
exports.verifyTurnstile = void 0;
const axios_1 = __importDefault(require("axios"));
const verifyTurnstile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token;
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET;
    if (!token) {
        return res.status(400).json({ success: false, message: 'Turnstile token missing.' });
    }
    console.log({ seeSecret: secret });
    try {
        const response = yield axios_1.default.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', new URLSearchParams({ secret, response: token }));
        const data = response.data;
        if (!data.success) {
            console.warn('Turnstile verification failed:', data['error-codes']);
            return res.status(403).json({
                success: false,
                message: 'Human verification failed. Please retry.',
            });
        }
        next(); // Token valid → move to actual login logic
    }
    catch (error) {
        console.error('Turnstile verification error:', error);
        return res.status(500).json({ success: false, message: 'Verification service error.' });
    }
});
exports.verifyTurnstile = verifyTurnstile;
