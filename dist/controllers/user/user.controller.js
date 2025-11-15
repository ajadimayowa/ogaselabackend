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
exports.deleteUser = exports.updateBusinessInfo = exports.doKyc = exports.updateProfile = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const User_model_1 = __importDefault(require("../../models/User.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_model_2 = __importDefault(require("../../models/User.model"));
// Get all users (with pagination & search)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        // Search by full name or email (case-insensitive)
        if (search) {
            query.$or = [
                { "profile.fullName": { $regex: search, $options: "i" } },
                { "contact.email": { $regex: search, $options: "i" } },
            ];
        }
        const total = yield User_model_1.default.countDocuments(query);
        const users = yield User_model_1.default.find(query)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Users retrieved successfully",
            pagination: {
                total,
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error,
        });
    }
});
exports.getAllUsers = getAllUsers;
// Get single user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const user = yield User_model_2.default.findById(id).select("-profile.password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User retrieved successfully",
            payload: user,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error,
        });
    }
});
exports.getUserById = getUserById;
// Update user profile or KYC
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { fullName, firstName, lastName, phoneNumber, bio, profilePicUrl, kyc, isDisabled, isBanned, } = req.body;
        const user = yield User_model_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Profile updates
        if (fullName)
            user.profile.fullName = fullName;
        if (firstName)
            user.profile.firstName = firstName;
        if (lastName)
            user.profile.lastName = lastName;
        if (bio)
            user.profile.bio = bio;
        if (profilePicUrl)
            user.profile.profilePicUrl = profilePicUrl;
        if (phoneNumber)
            user.contact.phoneNumber = phoneNumber;
        // KYC updates
        if (kyc) {
            if (kyc.idCardNumber)
                user.kyc.idCardNumber = kyc.idCardNumber;
            if (kyc.idCardPhoto)
                user.kyc.idCardPhoto = kyc.idCardPhoto;
            if (typeof kyc.isVerified === "boolean") {
                user.kyc.isKycCompleted = kyc.isVerified;
                if (kyc.isVerified)
                    user.kyc.verifiedAt = new Date();
            }
        }
        if (isDisabled !== undefined)
            user.isDisable = isDisabled;
        if (isBanned !== undefined)
            user.isBanned = isBanned;
        const updatedUser = yield user.save();
        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error,
        });
    }
});
exports.updateUser = updateUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { bio, homeAddress } = req.body;
        console.log({ receivedUserId: userId, uploadedFile: req.file });
        const user = yield User_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // ✅ Only allow updating bio and profilePicUrl
        if (bio !== undefined) {
            user.profile.bio = bio;
        }
        if (homeAddress !== undefined) {
            user.contact.address = homeAddress;
        }
        // ✅ Handle uploaded image via multer-s3
        if (req.file && req.file.location) {
            user.profile.profilePicUrl = req.file.location;
        }
        yield user.save();
        res.status(200).json({
            message: "Profile updated successfully",
            profile: {
                bio: user.profile.bio,
                homeAddress: user.contact.address,
                profilePicUrl: user.profile.profilePicUrl,
            },
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateProfile = updateProfile;
const doKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.path;
    const { idCardNumber, idCardPhoto } = req.body;
    const user = yield User_model_1.default.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    user.kyc = {
        idCardNumber: idCardNumber !== null && idCardNumber !== void 0 ? idCardNumber : (_a = user.kyc) === null || _a === void 0 ? void 0 : _a.idCardNumber,
        idCardPhoto: idCardPhoto !== null && idCardPhoto !== void 0 ? idCardPhoto : (_b = user.kyc) === null || _b === void 0 ? void 0 : _b.idCardPhoto,
        isKycCompleted: true,
        verifiedAt: new Date(),
    };
    yield user.save();
    return res.status(200).json({
        success: true,
        message: "KYC completed successfully",
        payload: user.kyc,
    });
});
exports.doKyc = doKyc;
const updateBusinessInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const userId = req === null || req === void 0 ? void 0 : req.path; // assuming you attach user to req in auth middleware
    const { name, address, phoneNumber, regNumber, certificate, storeName } = req.body;
    const user = yield User_model_1.default.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.businessDetails = Object.assign(Object.assign({}, user.businessDetails), { name: name !== null && name !== void 0 ? name : (_a = user.businessDetails) === null || _a === void 0 ? void 0 : _a.name, address: address !== null && address !== void 0 ? address : (_b = user.businessDetails) === null || _b === void 0 ? void 0 : _b.address, phoneNumber: phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : (_c = user.businessDetails) === null || _c === void 0 ? void 0 : _c.phoneNumber, regNumber: regNumber !== null && regNumber !== void 0 ? regNumber : (_d = user.businessDetails) === null || _d === void 0 ? void 0 : _d.regNumber, certificate: certificate !== null && certificate !== void 0 ? certificate : (_e = user.businessDetails) === null || _e === void 0 ? void 0 : _e.certificate, storeName: storeName !== null && storeName !== void 0 ? storeName : (_f = user.businessDetails) === null || _f === void 0 ? void 0 : _f.storeName, isVerified: (_h = (_g = user.businessDetails) === null || _g === void 0 ? void 0 : _g.isVerified) !== null && _h !== void 0 ? _h : false, rating: (_k = (_j = user.businessDetails) === null || _j === void 0 ? void 0 : _j.rating) !== null && _k !== void 0 ? _k : 0, totalSales: (_m = (_l = user.businessDetails) === null || _l === void 0 ? void 0 : _l.totalSales) !== null && _m !== void 0 ? _m : 0 });
    yield user.save();
    res.status(200).json({
        success: true,
        message: "Business information updated successfully",
        payload: user.businessDetails,
    });
});
exports.updateBusinessInfo = updateBusinessInfo;
// Delete user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const deleted = yield User_model_1.default.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error,
        });
    }
});
exports.deleteUser = deleteUser;
