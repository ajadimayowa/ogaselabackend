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
exports.verifyOtp = exports.adminRegisterStaff = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Staff_1 = __importDefault(require("../models/Staff"));
const adminRegisterStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    try {
        const existingUser = yield Staff_1.default.findOne({ email });
        if (existingUser)
            res.status(400).json({ msg: 'User already exists' });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new Staff_1.default({
            fullName,
            email,
            password: hashedPassword
        });
        yield user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.adminRegisterStaff = adminRegisterStaff;
// export const staffLogin = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {res.status(400).json({ msg: 'Invalid credentials' })};
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
//     const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes;
//     const [firstName] = user.fullName.trim().split(' '); // Safely extract first name
//     user.loginOtp = otp;
//     user.loginOtpExpires = otpExpires;
//     await user.save();
//     // TODO: Send OTP via email/SMS
//     sendLoginOtpEmail(firstName,email,otp)
//     console.log(`OTP for ${user.email}: ${otp}`);
//     res.status(200).json({ success: true, message: 'OTP sent to your email' });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// };
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const user = yield Staff_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ msg: 'Invalid email or OTP' });
        if (!user.loginOtp || user.loginOtp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        if (user.loginOtpExpires && user.loginOtpExpires < new Date()) {
            return res.status(400).json({ msg: 'OTP has expired' });
        }
        // OTP is valid — clear it and login user
        user.loginOtp = undefined;
        user.loginOtpExpires = undefined;
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Login successful', payload: { token: token, userInfo: user } });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.verifyOtp = verifyOtp;
