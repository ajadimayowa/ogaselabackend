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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const User_model_1 = __importDefault(require("../../models/User.model"));
const mongoose_1 = __importDefault(require("mongoose"));
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
        const user = yield User_model_1.default.findById(id).populate("ads", "title price");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User retrieved successfully",
            data: user,
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
