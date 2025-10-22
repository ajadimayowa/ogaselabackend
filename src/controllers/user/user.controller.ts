import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User.model";
import mongoose from "mongoose";
import * as crypto from "crypto";


// Get all users (with pagination & search)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const query: any = {};

        // Search by full name or email (case-insensitive)
        if (search) {
            query.$or = [
                { "profile.fullName": { $regex: search, $options: "i" } },
                { "contact.email": { $regex: search, $options: "i" } },
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
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
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error,
        });
    }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const user = await User.findById(id).populate("ads", "title price");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            message: "User retrieved successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error,
        });
    }
};

// Update user profile or KYC
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            fullName,
            firstName,
            lastName,
            phoneNumber,
            bio,
            profilePicUrl,
            kyc,
            isDisabled,
            isBanned,
        } = req.body;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Profile updates
        if (fullName) user.profile.fullName = fullName;
        if (firstName) user.profile.firstName = firstName;
        if (lastName) user.profile.lastName = lastName;
        if (bio) user.profile.bio = bio;
        if (profilePicUrl) user.profile.profilePicUrl = profilePicUrl;
        if (phoneNumber) user.contact.phoneNumber = phoneNumber;

        // KYC updates
        if (kyc) {
            if (kyc.idCardNumber) user.kyc.idCardNumber = kyc.idCardNumber;
            if (kyc.idCardPhoto) user.kyc.idCardPhoto = kyc.idCardPhoto;
            if (typeof kyc.isVerified === "boolean") {
                user.kyc.isKycCompleted = kyc.isVerified;
                if (kyc.isVerified) user.kyc.verifiedAt = new Date();
            }
        }

        if (isDisabled !== undefined) user.isDisable = isDisabled;
        if (isBanned !== undefined) user.isBanned = isBanned;

        const updatedUser = await user.save();

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error,
        });
    }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error,
        });
    }
};