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
exports.fundBranch = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Branch_model_1 = require("../../models/Branch.model");
const BranchFundTransaction_model_1 = require("../../models/BranchFundTransaction.model");
const fundBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { branchId, organizationId, amount, purpose, reference, createdBy, approvedBy } = req.body;
        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ message: "Funding amount must be greater than 0" });
        }
        // Find branch
        const branch = yield Branch_model_1.Branch.findById(branchId).session(session);
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }
        console.log({ seeBranch: branch, sentId: branchId });
        if (!branch.bankDetails) {
            return res.status(400).json({ message: "Branch does not have active bank details" });
        }
        // Create transaction
        const transaction = yield BranchFundTransaction_model_1.BranchFundTransaction.create([
            {
                branch: branch.id,
                organization: organizationId,
                amount: +amount,
                type: "CREDIT",
                purpose,
                reference,
                accountSnapshot: {
                    bankName: branch.bankDetails.bankName,
                    accountNumber: branch.bankDetails.accountNumber,
                    accountName: branch.bankDetails.accountName,
                },
                createdBy,
                approvedBy,
            },
        ], { session });
        // Update branch balance
        branch.currentBalance += amount;
        yield branch.save({ session });
        // Commit transaction
        yield session.commitTransaction();
        session.endSession();
        return res.status(201).json({
            message: "Branch funded successfully",
            transaction: transaction[0],
            newBalance: branch.currentBalance,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({ message: "Failed to fund branch", error: error.message });
    }
});
exports.fundBranch = fundBranch;
