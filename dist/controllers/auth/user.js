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
exports.resetUserPasswordWithOtp = exports.requestPasswordResetOtp = exports.verifyLoginOtp = exports.loginUser = exports.verifyUserEmail = exports.createUser = void 0;
const User_model_1 = __importDefault(require("../../models/User.model"));
const otpUtils_1 = require("../../utils/otpUtils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usersEmailNotifs_1 = require("../../services/email/ogasela/usersEmailNotifs");
const userLoginOtpEmailNotifs_1 = require("../../services/email/ogasela/userLoginOtpEmailNotifs");
// ✅ Register New User
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, phoneNumber, password, isAdmin } = req.body;
        console.log({ seeAd: isAdmin });
        if (!fullName || !email || !phoneNumber || !password) {
            return res.status(401).json({ success: false, message: 'Incomplete Data' });
        }
        let properEmail = email.trim().toLowerCase() || '';
        // Check if user already exists
        const existingUser = yield User_model_1.default.findOne({ "contact.email": properEmail });
        if (existingUser) {
            res.status(400).json({ message: "User already exists with this email" });
            return;
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Generate verification token
        const emailVerificationCode = (0, otpUtils_1.generateOtp)();
        const emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        let firstName = fullName.split(' ')[0];
        let lastName = fullName.split(' ')[1];
        const newUser = yield User_model_1.default.create({
            profile: { fullName, firstName, lastName, password: hashedPassword },
            contact: { email: properEmail, phoneNumber },
            emailVerificationToken: emailVerificationCode,
            isAdmin: isAdmin,
            emailVerificationExpires,
        });
        // Send email verification
        yield (0, usersEmailNotifs_1.sendUserRegistrationNotificationEmail)({ firstName, email: properEmail, emailVerificationCode });
        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            data: { id: newUser._id, email: newUser.contact.email },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error registering user", error });
    }
});
exports.createUser = createUser;
// ✅ VERIFY USER EMAIL
const verifyUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query; // token sent in email link
        if (!token) {
            res.status(400).json({ message: "Verification token is required" });
            return;
        }
        // Find user by token
        const user = yield User_model_1.default.findOne({ emailVerificationToken: token });
        if (!user) {
            res.status(404).json({ message: "Invalid or expired verification token" });
            return;
        }
        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined; // clear the token
        // If phone number already verified elsewhere, keep it
        user.isPhoneVerified = user.isPhoneVerified || false;
        yield user.save();
        // Send confirmation email
        // await sendEmailVerified(user.contact.email, user.profile.fullName);
        res.status(200).json({
            message: "Email verified successfully",
            data: {
                emailVerified: user.isEmailVerified,
                phoneVerified: user.isPhoneVerified,
            },
        });
    }
    catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ message: "Error verifying email", error });
    }
});
exports.verifyUserEmail = verifyUserEmail;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({ success: false, message: 'Un Authorized user!' });
    }
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = yield User_model_1.default.findOne({ "contact.email": normalizedEmail });
        // To prevent timing attacks, run bcrypt.compare even if user doesn't exist
        const dummyHash = "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.profile.password) || dummyHash);
        if (!user || !isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        const otp = (0, otpUtils_1.generateOtp)(); // 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.loginOtp = otp;
        user.loginOtpExpires = otpExpires;
        yield user.save();
        // await sendLoginOtp({
        //   to:staff.phoneNumber,
        //   code:+otp,
        //   firstName:staff.firstName
        // })
        try {
            yield (0, userLoginOtpEmailNotifs_1.sendUserLoginOtpNotificationEmail)({ firstName: user.profile.firstName, email: user.contact.email, loginOtpCode: otp });
        }
        catch (error) {
            console.error('Error sending OTP email:', error);
        }
        return res.status(200).json({
            success: true,
            message: 'OTP sent to email',
            payload: {
                email: user.contact.email,
                expiresAt: otpExpires,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error,
        });
    }
});
exports.loginUser = loginUser;
const verifyLoginOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    // console.log({email, otp});
    try {
        const user = yield User_model_1.default.findOne({ "contact.email": normalizedEmail }).select("-profile.password");
        console.log({ seeStaffHere: user });
        // const organisation = Organization.findById(staff?.organization)
        if (!user) {
            res.status(404).json({ success: false, message: 'Staff not found' });
            return;
        }
        if (!user.loginOtp ||
            user.loginOtp !== otp ||
            !user.loginOtpExpires ||
            user.loginOtpExpires < new Date()) {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            return;
        }
        // Clear OTP
        user.loginOtp = undefined;
        user.loginOtpExpires = undefined;
        yield user.save();
        const payload = {
            id: user.id,
            email: user.contact.email,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            payload: {
                token: token,
                userBio: user
            }
        });
        yield (0, userLoginOtpEmailNotifs_1.sendUserLoginNotificationEmail)({ firstName: user.profile.firstName, email: user.contact.email, loginOtpCode: otp });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        return;
    }
});
exports.verifyLoginOtp = verifyLoginOtp;
const requestPasswordResetOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    console.log('sent email:', normalizedEmail);
    try {
        const user = yield User_model_1.default.findOne({ "contact.email": normalizedEmail });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User with this email does not exist',
            });
            return;
        }
        const otp = (0, otpUtils_1.generateOtp)(); // generate 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes
        user.resetPasswordOtp = otp;
        user.loginOtp = undefined;
        user.emailVerificationToken = undefined;
        user.loginOtpExpires = undefined;
        user.resetPasswordOtpExpires = otpExpires;
        yield user.save();
        try {
            yield (0, userLoginOtpEmailNotifs_1.sendUserPasswordResetOtpEmail)({ firstName: user.profile.firstName, email: user.contact.email, passwordResetOtpCode: otp });
        }
        catch (err) {
            console.error('Error sending reset OTP email:', err);
        }
        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to email',
            payload: { email },
        });
        return;
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err,
        });
        return;
    }
});
exports.requestPasswordResetOtp = requestPasswordResetOtp;
const resetUserPasswordWithOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = req.body;
    let updatedOtp = +otp;
    if (!email || !updatedOtp || !newPassword) {
        res.status(400).json({
            success: false,
            message: 'Email, OTP, and new password are required',
        });
        return;
    }
    try {
        const staff = yield User_model_1.default.findOne({ "contact.email": email });
        if (!staff) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (!staff.resetPasswordOtp ||
            staff.resetPasswordOtp !== otp
        // !staff.resetPasswordOtpExpires ||
        // staff.resetPasswordOtpExpires < new Date()
        ) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        staff.profile.password = hashedPassword;
        staff.resetPasswordOtp = undefined;
        staff.emailVerificationToken = undefined;
        yield staff.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
        yield (0, userLoginOtpEmailNotifs_1.sendUserPasswordResetNotificationEmail)({ firstName: staff.profile.firstName, email: staff.contact.email, loginOtpCode: otp });
        return;
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err,
        });
        return;
    }
});
exports.resetUserPasswordWithOtp = resetUserPasswordWithOtp;
