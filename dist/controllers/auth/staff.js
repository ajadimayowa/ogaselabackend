"use strict";
// controllers/auth/staffLogin.ts
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
exports.verifyOtp = exports.loginStaff = void 0;
const Staff_1 = __importDefault(require("../../models/Staff"));
const otpUtils_1 = require("../../utils/otpUtils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailTypesHandler_1 = require("../../services/email/emailTypesHandler");
const Organization_1 = __importDefault(require("../../models/Organization"));
const loginStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const staff = yield Staff_1.default.findOne({ email });
        if (!staff) {
            res.status(404).json({ success: false, message: 'Staff not found' });
            return;
        }
        const otp = (0, otpUtils_1.generateOtp)(); // 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        staff.loginOtp = otp;
        staff.loginOtpExpires = otpExpires;
        yield staff.save();
        try {
            yield (0, emailTypesHandler_1.sendLoginOtpEmail)(staff.firstName, staff.email, otp);
        }
        catch (error) {
            console.error('Error sending OTP email:', error);
        }
        res.status(200).json({
            success: true,
            message: 'OTP sent to email',
            payload: { email: email }
        });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
        return;
    }
});
exports.loginStaff = loginStaff;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    // console.log({email, otp});
    try {
        const staff = yield Staff_1.default.findOne({ email });
        console.log({ seeStaffHere: staff });
        const organisation = Organization_1.default.findById(staff === null || staff === void 0 ? void 0 : staff.organization);
        if (!staff) {
            res.status(404).json({ success: false, message: 'Staff not found' });
            return;
        }
        if (!staff.loginOtp ||
            staff.loginOtp !== otp ||
            !staff.loginOtpExpires ||
            staff.loginOtpExpires < new Date()) {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            return;
        }
        // Clear OTP
        staff.loginOtp = undefined;
        staff.loginOtpExpires = undefined;
        yield staff.save();
        const payload = {
            id: staff.id,
            email: staff.email,
            userClass: staff.userClass,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        const organization = yield Organization_1.default.findById(staff.organization);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            payload: {
                staffInfo: staff,
                organizationInfo: organization,
            }
        });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        return;
    }
});
exports.verifyOtp = verifyOtp;
