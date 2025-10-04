import { Request, Response } from "express";
import LoanModel from "../../models/Loan.model";
import { Branch } from "../../models/Branch.model";
import mongoose from "mongoose";

// ================= CREATE LOAN =================
export const createLoan = async (req: Request, res: Response): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { organization, branch, principal, interestRate, tenureMonths, lateFeeRate, calculationMethod, member,group, marketerId } = req.body;

    // 1. Fetch branch and check balance
    const branchDoc = await Branch.findById(branch).session(session);
    if (!branchDoc) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Branch not found" });
    }

    if (branchDoc.currentBalance < principal) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient branch balance to disburse loan",
      });
    }

    // 2. Compute total repayable (principal + interest)
    const interestAmount = (principal * interestRate) / 100;
    const totalRepayable = principal + interestAmount;

    // 3. Create Loan
    const newLoan = await LoanModel.create(
      [
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
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Loan application created successfully",
      loan: newLoan[0],
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

// ================= READ LOANS =================
export const getLoans = async (req: Request, res: Response): Promise<any> => {
  try {
    let {
      page = "1",
      limit = "10",
      organization,
      branch,
      group,
      marketerId,
      status,
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build filters dynamically
    const filters: any = {};
    if (organization) filters.organization = organization;
    if (branch) filters.branch = branch;
    if (marketerId) filters.createdBy = marketerId;
    if (status) filters.status = status;

    // If you have group relation through member
    if (group) filters["member.group"] = group;

    // Query with filters, pagination, and sorting
    const [loans, total] = await Promise.all([
      LoanModel.find(filters)
        .populate("member")
        .populate("group")
        .populate("branch")
        .populate("createdBy")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      LoanModel.countDocuments(filters),
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
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLoanById = async (req: Request, res: Response): Promise<any> => {
  try {
    const loan = await LoanModel.findById(req.params.id)
      .populate("member")
      .populate("group")
      .populate("branch", "name")
      .populate("createdBy", "fullName email");
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    return res.json({success:true,payload: loan });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE LOAN =================
export const updateLoan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const loan = await LoanModel.findById(id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    // Only update certain fields before approval/disbursement
    if (loan.status !== "pending_authorizer") {
      return res.status(400).json({ message: "Cannot update loan after authorization process" });
    }

    Object.assign(loan, req.body);
    await loan.save();

    return res.json({ message: "Loan updated successfully", loan });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= DELETE LOAN =================
export const deleteLoan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const loan = await LoanModel.findById(id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    // Only deletable if still pending
    if (loan.status !== "pending_authorizer") {
      return res.status(400).json({ message: "Cannot delete loan after authorization process" });
    }

    await LoanModel.findByIdAndDelete(id);

    return res.json({ message: "Loan deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= ADD REPAYMENT =================
export const addRepayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { amount, method, reference, marketerId } = req.body;

    const loan = await LoanModel.findById(id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

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
      } else {
        loan.balance += (loan.balance * loan.penalty.lateFeeRate) / 100;
      }
    }

    if (loan.balance <= 0) {
      loan.status = "closed";
      loan.balance = 0;
    }

    await loan.save();

    return res.json({ message: "Repayment added successfully", loan });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
