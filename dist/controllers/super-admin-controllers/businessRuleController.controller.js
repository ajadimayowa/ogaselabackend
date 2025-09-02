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
exports.deleteBusinessRule = exports.updateBusinessRule = exports.getBusinessRule = exports.createBusinessRule = void 0;
const BusinessRule_1 = __importDefault(require("../../models/BusinessRule"));
// ✅ CREATE Business Rule (one per company)
const createBusinessRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId, interestRates, loanDurations, penaltyFee, dailyLatePercentage, createdBy } = req.body;
        // Check if company already has a rule
        const existingRule = yield BusinessRule_1.default.findOne({ companyId });
        if (existingRule) {
            return res.status(400).json({ message: "Business rule already exists for this company" });
        }
        const rule = yield BusinessRule_1.default.create({
            companyId,
            interestRates,
            penaltyFee,
            dailyLatePercentage,
            createdBy,
        });
        return res.status(201).json({ message: "Business rule created successfully", data: rule });
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating business rule", error });
    }
});
exports.createBusinessRule = createBusinessRule;
// ✅ GET Business Rule by company
const getBusinessRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const rule = yield BusinessRule_1.default.findOne({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not found" });
        }
        return res.status(200).json({ data: rule });
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching business rule", error });
    }
});
exports.getBusinessRule = getBusinessRule;
// ✅ UPDATE Business Rule (with change history)
const updateBusinessRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const { interestRates, loanDurations, penaltyFee, dailyLatePercentage, updatedBy } = req.body;
        const rule = yield BusinessRule_1.default.findOne({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not found" });
        }
        // Track changes
        const updates = {};
        if (interestRates !== undefined && interestRates !== rule.interestRates) {
            rule.changeHistory.push({
                changedBy: updatedBy,
                oldValue: rule.interestRates,
                newValue: interestRates,
                field: "interestRate",
                changedAt: new Date()
            });
            updates.interestRate = interestRates;
        }
        if (loanDurations !== undefined) {
            rule.changeHistory.push({
                changedBy: updatedBy,
                oldValue: rule.loanDurations,
                newValue: loanDurations,
                field: "loanDurations",
                changedAt: new Date()
            });
            updates.loanDurations = loanDurations;
        }
        if (penaltyFee !== undefined && penaltyFee !== rule.penaltyFee) {
            rule.changeHistory.push({
                changedBy: updatedBy,
                oldValue: rule.penaltyFee,
                newValue: penaltyFee,
                field: "penaltyFee",
                changedAt: new Date()
            });
            updates.penaltyFee = penaltyFee;
        }
        if (dailyLatePercentage !== undefined && dailyLatePercentage !== rule.dailyLatePercentage) {
            rule.changeHistory.push({
                changedBy: updatedBy,
                oldValue: rule.dailyLatePercentage,
                newValue: dailyLatePercentage,
                field: "dailyLatePercentage",
                changedAt: new Date()
            });
            updates.dailyLatePercentage = dailyLatePercentage;
        }
        Object.assign(rule, updates);
        rule.updatedBy = updatedBy;
        yield rule.save();
        return res.status(200).json({ message: "Business rule updated successfully", data: rule });
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating business rule", error });
    }
});
exports.updateBusinessRule = updateBusinessRule;
// ✅ DELETE Business Rule
const deleteBusinessRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const rule = yield BusinessRule_1.default.findOneAndDelete({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not found" });
        }
        return res.status(200).json({ message: "Business rule deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting business rule", error });
    }
});
exports.deleteBusinessRule = deleteBusinessRule;
