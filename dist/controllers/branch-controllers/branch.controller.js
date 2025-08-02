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
exports.approveBranch = exports.deleteBranch = exports.updateBranch = exports.getBranch = exports.getBranches = exports.createBranch = void 0;
const Branch_1 = __importDefault(require("../../models/Branch"));
const emailTypesHandler_1 = require("../../services/email/emailTypesHandler");
const moment_1 = __importDefault(require("moment"));
// ✅ Create Branch
const createBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nameOfBranch, branchManager, branchAddress, state, lga, createdByName, createdById, selectedApprover, organization, nameOfOrg, orgEmail } = req.body;
    try {
        const existing = yield Branch_1.default.findOne({ nameOfBranch, organization });
        if (existing) {
            res.status(400).json({ success: false, message: 'Branch name already exists for this organization' });
        }
        if (!nameOfOrg || !orgEmail) {
            res.status(400).json({ success: true, message: 'Organisation does not exist!' });
            return;
        }
        yield Branch_1.default.create({
            nameOfBranch,
            branchManager: {
                id: branchManager === null || branchManager === void 0 ? void 0 : branchManager.id,
                fullName: branchManager === null || branchManager === void 0 ? void 0 : branchManager.fullName,
            },
            branchAddress,
            state,
            lga,
            createdByName,
            createdById,
            selectedApprover,
            organization,
        });
        res.status(201).json({ success: true, message: 'New branch created succesfully!' });
        try {
            yield (0, emailTypesHandler_1.sendBranchCreationEmail)(nameOfOrg, orgEmail, nameOfBranch, (0, moment_1.default)().format('DD/MM/YYYY HH:MM A'), createdByName);
        }
        catch (error) {
        }
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating branch', error });
    }
});
exports.createBranch = createBranch;
// 📥 Get Branches (with optional filters)
const getBranches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationId, isApproved } = req.query;
    const filter = {};
    if (organizationId)
        filter.organization = organizationId;
    if (isApproved !== undefined)
        filter.isApproved = isApproved === 'true';
    try {
        const branches = yield Branch_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, payload: branches });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching branches', error });
    }
});
exports.getBranches = getBranches;
// 🔍 Get Single Branch
const getBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const branch = yield Branch_1.default.findById(id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, data: branch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving branch', error });
    }
});
exports.getBranch = getBranch;
// ✏️ Update Branch
const updateBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const updated = yield Branch_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error updating branch', error });
    }
});
exports.updateBranch = updateBranch;
// ❌ Soft Delete Branch
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield Branch_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, message: 'Branch deleted (soft)', data: deleted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting branch', error });
    }
});
exports.deleteBranch = deleteBranch;
// 🧾 Approve Branch
const approveBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { approvedById, approvedName } = req.body;
    try {
        const approved = yield Branch_1.default.findByIdAndUpdate(id, { isApproved: true, approvedById, approvedName }, { new: true });
        if (!approved) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, message: 'Branch approved', data: approved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error approving branch', error });
    }
});
exports.approveBranch = approveBranch;
