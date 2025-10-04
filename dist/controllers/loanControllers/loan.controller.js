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
exports.addRepayment = exports.deleteLoan = exports.updateLoan = exports.getLoanById = exports.getLoans = exports.createLoan = void 0;
const Loan_model_1 = __importDefault(require("../../models/Loan.model"));
const Branch_model_1 = require("../../models/Branch.model");
const mongoose_1 = __importDefault(require("mongoose"));
// ================= CREATE LOAN =================
const createLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { organization, branch, principal, interestRate, tenureMonths, lateFeeRate, calculationMethod, member, group, marketerId } = req.body;
        // 1. Fetch branch and check balance
        const branchDoc = yield Branch_model_1.Branch.findById(branch).session(session);
        if (!branchDoc) {
            yield session.abortTransaction();
            return res.status(404).json({ message: "Branch not found" });
        }
        if (branchDoc.currentBalance < principal) {
            yield session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient branch balance to disburse loan",
            });
        }
        // 2. Compute total repayable (principal + interest)
        const interestAmount = (principal * interestRate) / 100;
        const totalRepayable = principal + interestAmount;
        // 3. Create Loan
        const newLoan = yield Loan_model_1.default.create([
            {
                organization: organization,
                branch,
                group,
                member,
                createdBy: marketerId,
                principal,
                interestRate,
                tenureMonths,
                totalRepayable,
                balance: totalRepayable, // initially balance = total repayable
                penalty: {
                    lateFeeRate: lateFeeRate,
                    calculationMethod: calculationMethod,
                    gracePeriodDays: 2,
                },
                status: "pending_authorizer",
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        return res.status(201).json({
            message: "Loan application created successfully",
            loan: newLoan[0],
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
});
exports.createLoan = createLoan;
// ================= READ LOANS =================
const getLoans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page = "1", limit = "10", organization, branch, group, marketerId, status, } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;
        // Build filters dynamically
        const filters = {};
        if (organization)
            filters.organization = organization;
        if (branch)
            filters.branch = branch;
        if (marketerId)
            filters.createdBy = marketerId;
        if (status)
            filters.status = status;
        // If you have group relation through member
        if (group)
            filters["member.group"] = group;
        // Query with filters, pagination, and sorting
        const [loans, total] = yield Promise.all([
            Loan_model_1.default.find(filters)
                .populate("member")
                .populate("group")
                .populate("branch")
                .populate("createdBy")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Loan_model_1.default.countDocuments(filters),
        ]);
        return res.status(200).json({
            success: true,
            payload: loans,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.getLoans = getLoans;
const getLoanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loan = yield Loan_model_1.default.findById(req.params.id)
            .populate("member")
            .populate("group")
            .populate("branch", "name")
            .populate("createdBy", "fullName email");
        if (!loan)
            return res.status(404).json({ message: "Loan not found" });
        return res.json({ success: true, payload: loan });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.getLoanById = getLoanById;
// ================= UPDATE LOAN =================
const updateLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const loan = yield Loan_model_1.default.findById(id);
        if (!loan)
            return res.status(404).json({ message: "Loan not found" });
        // Only update certain fields before approval/disbursement
        if (loan.status !== "pending_authorizer") {
            return res.status(400).json({ message: "Cannot update loan after authorization process" });
        }
        Object.assign(loan, req.body);
        yield loan.save();
        return res.json({ message: "Loan updated successfully", loan });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.updateLoan = updateLoan;
// ================= DELETE LOAN =================
const deleteLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const loan = yield Loan_model_1.default.findById(id);
        if (!loan)
            return res.status(404).json({ message: "Loan not found" });
        // Only deletable if still pending
        if (loan.status !== "pending_authorizer") {
            return res.status(400).json({ message: "Cannot delete loan after authorization process" });
        }
        yield Loan_model_1.default.findByIdAndDelete(id);
        return res.json({ message: "Loan deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.deleteLoan = deleteLoan;
// ================= ADD REPAYMENT =================
const addRepayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, method, reference, marketerId } = req.body;
        const loan = yield Loan_model_1.default.findById(id);
        if (!loan)
            return res.status(404).json({ message: "Loan not found" });
        // Add repayment
        loan.repayments.push({
            amount,
            method,
            reference,
            receivedBy: marketerId,
            date: new Date(),
        });
        // Deduct from balance
        loan.balance -= amount;
        // Apply penalty if repayment late
        // (simple logic — you can expand based on grace period)
        const today = new Date();
        const dueDate = new Date(loan.createdAt);
        dueDate.setMonth(dueDate.getMonth() + loan.tenureMonths);
        if (today > dueDate) {
            if (loan.penalty.calculationMethod === "flat") {
                loan.balance += loan.penalty.lateFeeRate;
            }
            else {
                loan.balance += (loan.balance * loan.penalty.lateFeeRate) / 100;
            }
        }
        if (loan.balance <= 0) {
            loan.status = "closed";
            loan.balance = 0;
        }
        yield loan.save();
        return res.json({ message: "Repayment added successfully", loan });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.addRepayment = addRepayment;
