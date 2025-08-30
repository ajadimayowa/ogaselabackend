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
exports.resetStaffPasswordWithOtp = exports.requestPasswordResetOtp = exports.verifyLoginOtp = exports.loginStaff = void 0;
const Staff_1 = __importDefault(require("../../models/Staff"));
const otpUtils_1 = require("../../utils/otpUtils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailTypesHandler_1 = require("../../services/email/emailTypesHandler");
const Organization_1 = require("../../models/Organization");
const Department_model_1 = require("../../models/Department.model");
const Role_1 = __importDefault(require("../../models/Role"));
const loginStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const staff = yield Staff_1.default.findOne({ email: normalizedEmail });
        // To prevent timing attacks, run bcrypt.compare even if user doesn't exist
        const dummyHash = "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, (staff === null || staff === void 0 ? void 0 : staff.password) || dummyHash);
        if (!staff || !isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
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
        return res.status(200).json({
            success: true,
            message: 'OTP sent to email',
            payload: {
                email: staff.email,
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
exports.loginStaff = loginStaff;
const verifyLoginOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    // console.log({email, otp});
    try {
        const staff = yield Staff_1.default.findOne({ email: email.trim().toLowerCase() })
            .populate("branch", "name"); // or "branchName" depending on your Branch schema
        console.log({ seeStaffHere: staff });
        // const organisation = Organization.findById(staff?.organization)
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
        const organization = yield Organization_1.Organization.findById(staff.organization);
        const staffDepartment = yield Department_model_1.Department.findById(staff.department);
        const staffRole = yield Role_1.default.findById(staff.roles[0]);
        let staffData = {
            id: staff === null || staff === void 0 ? void 0 : staff._id,
            fullName: staff === null || staff === void 0 ? void 0 : staff.fullName,
            branch: (staff === null || staff === void 0 ? void 0 : staff.branch)
                ? staff.branch
                : null,
            firstName: staff === null || staff === void 0 ? void 0 : staff.firstName,
            department: staff === null || staff === void 0 ? void 0 : staff.department,
            organization: staff.organization,
            role: staff.roles[0],
            staffLevel: staff === null || staff === void 0 ? void 0 : staff.staffLevel,
            userClass: staff.userClass,
            staffNokInformation: staff === null || staff === void 0 ? void 0 : staff.staffNok,
            staffKycInformation: staff === null || staff === void 0 ? void 0 : staff.staffKyc,
            homeAddress: staff === null || staff === void 0 ? void 0 : staff.homeAddress,
            phoneNumber: `0${staff === null || staff === void 0 ? void 0 : staff.phoneNumber}`,
            isApproved: staff === null || staff === void 0 ? void 0 : staff.isApproved,
            isDisabled: staff.isDisabled,
            emailIsVerified: staff === null || staff === void 0 ? void 0 : staff.emailIsVerified,
            isSuperAdmin: staff === null || staff === void 0 ? void 0 : staff.isSuperAdmin,
            isPasswordUpdated: staff === null || staff === void 0 ? void 0 : staff.isPasswordUpdated,
            lga: staff === null || staff === void 0 ? void 0 : staff.lga,
            state: staff === null || staff === void 0 ? void 0 : staff.state,
            createdAt: staff === null || staff === void 0 ? void 0 : staff.createdAt,
            updatedAt: staff === null || staff === void 0 ? void 0 : staff.updatedAt,
        };
        let organisationData = {
            id: organization === null || organization === void 0 ? void 0 : organization._id,
            nameOfOrg: organization === null || organization === void 0 ? void 0 : organization.name,
            orgEmail: organization === null || organization === void 0 ? void 0 : organization.email,
            orgAddress: organization === null || organization === void 0 ? void 0 : organization.address,
            orgLga: organization === null || organization === void 0 ? void 0 : organization.lga,
            orgState: organization === null || organization === void 0 ? void 0 : organization.state,
            orgPhoneNumber: `0${organization === null || organization === void 0 ? void 0 : organization.phoneNumber}`,
            orgSubscriptionPlan: organization === null || organization === void 0 ? void 0 : organization.subscriptionPlan,
            orgRegNumber: organization === null || organization === void 0 ? void 0 : organization.regNumber,
            createdAt: organization === null || organization === void 0 ? void 0 : organization.createdAt,
            updatedAt: organization === null || organization === void 0 ? void 0 : organization.updatedAt
        };
        let staffDepartmentData = {
            id: staffDepartment === null || staffDepartment === void 0 ? void 0 : staffDepartment.id,
            name: staffDepartment === null || staffDepartment === void 0 ? void 0 : staffDepartment.name,
        };
        let staffRoleData = {
            id: staffRole === null || staffRole === void 0 ? void 0 : staffRole.id,
            name: staffRole === null || staffRole === void 0 ? void 0 : staffRole.name,
            permisions: staffRole === null || staffRole === void 0 ? void 0 : staffRole.permissions
        };
        res.status(200).json({
            success: true,
            message: 'Login successful',
            payload: {
                token: token,
                staffData,
                organisationData,
                staffDepartmentData,
                staffRoleData
            }
        });
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
    try {
        const staff = yield Staff_1.default.findOne({ email });
        if (!staff) {
            res.status(404).json({
                success: false,
                message: 'Staff with this email does not exist',
            });
            return;
        }
        const otp = (0, otpUtils_1.generateOtp)(); // generate 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes
        staff.resetPasswordOtp = otp;
        staff.loginOtp = undefined;
        staff.emailOtp = undefined;
        staff.loginOtpExpires = undefined;
        staff.emailOtpExpires = undefined;
        staff.emailIsVerified = false;
        staff.resetPasswordOtpExpires = otpExpires;
        yield staff.save();
        try {
            yield (0, emailTypesHandler_1.sendResetPasswordOtpEmail)(staff.firstName, staff.email, otp);
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
const resetStaffPasswordWithOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const staff = yield Staff_1.default.findOne({ email });
        if (!staff) {
            res.status(404).json({
                success: false,
                message: 'Staff not found',
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
        staff.password = hashedPassword;
        staff.resetPasswordOtp = undefined;
        staff.emailOtpExpires = undefined;
        staff.isPasswordUpdated = true;
        yield staff.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successful',
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
exports.resetStaffPasswordWithOtp = resetStaffPasswordWithOtp;
