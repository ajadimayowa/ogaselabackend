import { Request, Response } from "express";
import mongoose from "mongoose";
import { Branch } from "../../models/Branch.model";
import { BranchFundTransaction } from "../../models/BranchFundTransaction.model";

export const fundBranch = async (req: Request, res: Response):Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { branchId, organizationId, amount, purpose, reference, createdBy, approvedBy } = req.body;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: "Funding amount must be greater than 0" });
    }

    // Find branch
    const branch = await Branch.findById(branchId).session(session);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    console.log({seeBranch:branch, sentId:branchId})

    if (!branch.bankDetails) {
  return res.status(400).json({ message: "Branch does not have active bank details" });
}

    // Create transaction
    const transaction = await BranchFundTransaction.create(
      [
        {
          branch: branch.id,
          organization: organizationId,
          amount:+amount,
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
      ],
      { session }
    );

    // Update branch balance
    branch.currentBalance += amount;
    await branch.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Branch funded successfully",
      transaction: transaction[0],
      newBalance: branch.currentBalance,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Failed to fund branch", error: error.message });
  }
};
