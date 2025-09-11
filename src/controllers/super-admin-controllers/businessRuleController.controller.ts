import { Request, Response } from "express";
import BusinessRule from "../../models/BusinessRule";

// ✅ CREATE Business Rule (one per company)
export const createBusinessRule = async (req: Request, res: Response):Promise<any> => {
    try {
        const { companyId, interestRates, loanDurations, penaltyFee, dailyLatePercentage, createdBy } = req.body;

        // Check if company already has a rule
        const existingRule = await BusinessRule.findOne({ companyId });
        if (existingRule) {
            return res.status(400).json({ message: "Business rule already exists for this company" });
        }

        
const rule = await BusinessRule.create({
  companyId,
  interestRates,
  penaltyFee,
  dailyLatePercentage,
  createdBy,
});

        return res.status(201).json({ message: "Business rule created successfully", data: rule });
    } catch (error) {
        return res.status(500).json({ message: "Error creating business rule", error });
    }
};

// ✅ GET Business Rule by company
export const getBusinessRule = async (req: Request, res: Response):Promise<any> => {
    try {
        const { companyId } = req.params;

        const rule = await BusinessRule.findOne({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not found" });
        }

        return res.status(200).json({ payload: rule });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching business rule", error });
    }
};

// ✅ GET Business Rule by company
export const getBusinessRuleProducts = async (req: Request, res: Response):Promise<any> => {
    try {
        const { companyId } = req.params;

        const rule = await BusinessRule.findOne({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not set" });
        }

        return res.status(200).json({ data: rule.interestRates });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching business rule", error });
    }
};

// ✅ UPDATE Business Rule (with change history)
export const updateBusinessRule = async (req: Request, res: Response):Promise<any> => {
    try {
        const { companyId } = req.params;
        const { interestRates, loanDurations, penaltyFee, dailyLatePercentage, updatedBy } = req.body;

        const rule = await BusinessRule.findOne({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not found" });
        }

        // Track changes
        const updates: any = {};
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
        await rule.save();

        return res.status(200).json({ message: "Business rule updated successfully", data: rule });
    } catch (error) {
        return res.status(500).json({ message: "Error updating business rule", error });
    }
};

// ✅ DELETE Business Rule
export const deleteBusinessRule = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;

        const rule = await BusinessRule.findOneAndDelete({ companyId });
        if (!rule) {
            return res.status(404).json({ message: "Business rule not found" });
        }

        return res.status(200).json({ message: "Business rule deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting business rule", error });
    }
};