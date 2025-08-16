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
exports.transferStaff = exports.addStaffToBranch = exports.deleteBranch = exports.updateBranch = exports.getBranchById = exports.getBranches = exports.createBranch = void 0;
const Branch_model_1 = require("../../models/Branch.model");
const mongoose_1 = __importDefault(require("mongoose"));
const Staff_1 = __importDefault(require("../../models/Staff"));
// Create Branch
const createBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, manager, address, state, lga, organization, createdBy } = req.body;
        // Check unique name within the same organization
        const existingBranch = yield Branch_model_1.Branch.findOne({ name, organization, isDeleted: false });
        if (existingBranch) {
            return res.status(400).json({ message: "Branch name already exists in this organization" });
        }
        // Ensure manager is not managing another branch
        const managerExists = yield Branch_model_1.Branch.findOne({ manager, isDeleted: false });
        if (managerExists) {
            return res.status(400).json({ message: "This manager is already managing another branch" });
        }
        const branch = yield Branch_model_1.Branch.create({
            name,
            manager,
            address,
            state,
            lga,
            organization,
            createdBy,
            isDisabled: false,
            isDeleted: false,
        });
        return res.status(201).json(branch);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.createBranch = createBranch;
// Get Branches with Pagination + Filters
const getBranches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, name, status, organizationId } = req.query;
        const filters = { isDeleted: false };
        if (name)
            filters.name = { $regex: name, $options: "i" };
        if (status === "disabled")
            filters.isDisabled = true;
        if (status === "active")
            filters.isDisabled = false;
        if (organizationId)
            filters.organization = new mongoose_1.default.Types.ObjectId(organizationId);
        const branches = yield Branch_model_1.Branch.find(filters)
            .populate("manager", "fullName email")
            .populate("organization", "name")
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        const total = yield Branch_model_1.Branch.countDocuments(filters);
        return res.status(200).json({
            success: true,
            payload: branches,
            pagination: {
                total,
                page: +page,
                limit: +limit,
                totalPages: Math.ceil(total / +limit),
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.getBranches = getBranches;
// Get Branch by ID
const getBranchById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branch = yield Branch_model_1.Branch.findById(req.params.id)
            .populate("manager", "fullName email")
            .populate("organization", "name");
        if (!branch || branch.isDeleted) {
            return res.status(404).json({ message: "Branch not found" });
        }
        return res.status(200).json(branch);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.getBranchById = getBranchById;
// Update Branch
const updateBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, manager, address, state, lga, approvedBy } = req.body;
        const branch = yield Branch_model_1.Branch.findById(req.params.id);
        if (!branch || branch.isDeleted) {
            return res.status(404).json({ message: "Branch not found" });
        }
        // Check unique name in the same organization
        if (name && name !== branch.name) {
            const existing = yield Branch_model_1.Branch.findOne({ name, organization: branch.organization, isDeleted: false });
            if (existing) {
                return res.status(400).json({ message: "Branch name already exists in this organization" });
            }
        }
        // Check manager
        if (manager && manager.toString() !== branch.manager.toString()) {
            const managerExists = yield Branch_model_1.Branch.findOne({ manager, isDeleted: false });
            if (managerExists) {
                return res.status(400).json({ message: "This manager is already managing another branch" });
            }
            // Add to manager history
            branch.managerHistory.push({
                manager: branch.manager,
                from: new Date(),
                to: new Date(),
            });
            branch.manager = manager;
        }
        branch.name = name || branch.name;
        branch.address = address || branch.address;
        branch.state = state || branch.state;
        branch.lga = lga || branch.lga;
        branch.approvedBy = approvedBy || branch.approvedBy;
        yield branch.save();
        return res.status(200).json(branch);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.updateBranch = updateBranch;
// Soft Delete Branch
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branch = yield Branch_model_1.Branch.findById(req.params.id);
        if (!branch || branch.isDeleted) {
            return res.status(404).json({ message: "Branch not found" });
        }
        branch.isDeleted = true;
        yield branch.save();
        return res.status(200).json({ message: "Branch deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.deleteBranch = deleteBranch;
const addStaffToBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId, staffId, addedBy } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(branchId) || !mongoose_1.default.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({ message: "Invalid branchId or staffId" });
        }
        // Check if branch exists
        const branch = yield Branch_model_1.Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }
        // Check if staff exists
        const staff = yield Staff_1.default.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        // Ensure staff is not already assigned to another branch
        if (staff.branch) {
            return res.status(400).json({ message: "Staff already assigned to a branch" });
        }
        // Add staff to branch
        branch.staffs.push(staff.id);
        yield branch.save();
        // Update staff's current branch
        staff.branch = branch.id;
        staff.branchTransferHistory.push({
            toBranch: branch.id,
            transferDate: new Date(),
            transferedBy: addedBy
        });
        yield staff.save();
        return res.status(200).json({ message: "Staff added to branch successfully", branch, staff });
    }
    catch (error) {
        return res.status(500).json({ message: "Error adding staff to branch", error: error.message });
    }
});
exports.addStaffToBranch = addStaffToBranch;
// Transfer Staff Between Branches
const transferStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { staffId, newBranchId } = req.body;
        // Validate input
        if (!staffId || !newBranchId) {
            return res.status(400).json({ message: "staffId and newBranchId are required" });
        }
        const staff = yield Staff_1.default.findById(staffId).populate("branch");
        const newBranch = yield Branch_model_1.Branch.findById(newBranchId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        if (!newBranch) {
            return res.status(404).json({ message: "New branch not found" });
        }
        // Check if staff is already in the new branch
        if (((_a = staff.branch) === null || _a === void 0 ? void 0 : _a.toString()) === newBranchId) {
            return res.status(400).json({ message: "Staff is already in this branch" });
        }
        let previousBranchId = null;
        // If staff has a current branch, remove them from it
        if (staff.branch) {
            const previousBranch = yield Branch_model_1.Branch.findById(staff.branch);
            if (previousBranch) {
                previousBranch.staffs = previousBranch.staffs.filter((id) => id.toString() !== staffId.toString());
                yield previousBranch.save();
                previousBranchId = previousBranch._id;
            }
        }
        // Add staff to the new branch
        newBranch.staffs.push(staff.id);
        yield newBranch.save();
        // Update staff branch reference and history
        staff.branch = newBranch.id;
        staff.branchTransferHistory.push({
            fromBranch: previousBranchId,
            toBranch: newBranch.id,
            transferDate: new Date(),
        });
        yield staff.save();
        return res.status(200).json({
            message: "Staff transferred successfully",
            staff,
        });
    }
    catch (error) {
        console.error("Error transferring staff:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.transferStaff = transferStaff;
