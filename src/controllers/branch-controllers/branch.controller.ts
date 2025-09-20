import { Request, Response } from "express";
import { Branch } from "../../models/Branch.model";
import mongoose from "mongoose";
import Staff from "../../models/Staff";
import { BranchFundTransaction } from "../../models/BranchFundTransaction.model";

// Create Branch
export const createBranch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, manager, address, state, lga, organization, createdBy } = req.body;

        // Check unique name within the same organization
        const existingBranch = await Branch.findOne({ name, organization, isDeleted: false });
        if (existingBranch) {
            return res.status(400).json({ message: "Branch name already exists in this organization" });
        }

        // Ensure manager is not managing another branch
        const managerExists = await Branch.findOne({ manager, isDeleted: false });
        if (managerExists) {
            return res.status(400).json({ message: "This manager is already managing another branch" });
        }

        const branch = await Branch.create({
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
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Get Branches with Pagination + Filters
export const getBranches = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = 1, limit = 10, name, status, organizationId } = req.query;

        const filters: any = { isDeleted: false };

        if (name) filters.name = { $regex: name as string, $options: "i" };
        if (status === "disabled") filters.isDisabled = true;
        if (status === "active") filters.isDisabled = false;
        if (organizationId) filters.organization = new mongoose.Types.ObjectId(organizationId as string);

        const branches = await Branch.find(filters)
            .populate("manager", "fullName email")
            .populate("organization", "name")
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });

        const total = await Branch.countDocuments(filters);

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
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Get Branch by ID
export const getBranchById = async (req: Request, res: Response): Promise<any> => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate("manager", "fullName email")
      .populate("organization", "name");

    if (!branch || branch.isDeleted) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Fetch funding history (latest first)
    const fundHistory = await BranchFundTransaction.find({ branch: req.params.id })
      .sort({ createdAt: -1 });

      const totalFunding = fundHistory.reduce((sum, tx) => sum + tx.amount, 0);
    return res.status(200).json({
      success: true,
      payload: { branch, fundHistory,totalFunding },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Branch
export const updateBranch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, manager, address, state, lga, updatedBy, bankDetails } = req.body;

        const branch = await Branch.findById(req.params.id);
        if (!branch || branch.isDeleted) {
            return res.status(404).json({ message: "Branch not found" });
        }

        // Prevent currentBalance updates directly
        if ("currentBalance" in req.body) {
            return res.status(400).json({ message: "You cannot update current balance directly" });
        }

        // Check unique name in the same organization
        if (name && name !== branch.name) {
            const existing = await Branch.findOne({
                name,
                organization: branch.organization,
                isDeleted: false,
            });
            if (existing) {
                return res.status(400).json({ message: "Branch name already exists in this organization" });
            }
            branch.name = name;
        }

        // Check manager
        if (manager && manager.toString() !== branch.manager.toString()) {
            const managerExists = await Branch.findOne({ manager, isDeleted: false });
            if (managerExists) {
                return res.status(400).json({ message: "This manager is already managing another branch" });
            }

            // Add old manager to history
            branch.managerHistory.push({
                manager: branch.manager,
                from: new Date(),
                to: new Date(),
            });

            branch.manager = manager;
        }

        // Update other basic fields
        branch.address = address || branch.address;
        branch.state = state || branch.state;
        branch.lga = lga || branch.lga;
        branch.approvedBy = updatedBy || branch.approvedBy;

        await branch.save();

        return res.status(200).json(branch);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};


export const updateBranchBankDetails = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountName, isActive, updatedBy } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (branch.bankDetails) {
      // 🔄 Update only provided fields
      if (bankName) branch.bankDetails.bankName = bankName;
      if (accountNumber) branch.bankDetails.accountNumber = accountNumber;
      if (accountName) branch.bankDetails.accountName = accountName;
      if (typeof isActive === "boolean") branch.bankDetails.isActive = isActive;

      branch.bankDetails.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      branch.bankDetails.updatedAt = new Date();
    } else {
      // 🆕 Create if it doesn't exist yet
      branch.bankDetails = {
        bankName: bankName || "",
        accountNumber: accountNumber || "",
        accountName: accountName || "",
        createdBy: updatedBy,
        updatedBy: updatedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
    }

    await branch.save();

    return res.status(200).json({
      message: "Bank details updated successfully",
      bankDetails: branch.bankDetails,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Soft Delete Branch
export const deleteBranch = async (req: Request, res: Response): Promise<any> => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch || branch.isDeleted) {
            return res.status(404).json({ message: "Branch not found" });
        }

        branch.isDeleted = true;
        await branch.save();

        return res.status(200).json({ message: "Branch deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const addStaffToBranch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { branchId, staffId, addedBy } = req.body;

        if (!mongoose.Types.ObjectId.isValid(branchId) || !mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({ message: "Invalid branchId or staffId" });
        }

        // Check if branch exists
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }

        // Check if staff exists
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // Ensure staff is not already assigned to another branch
        if (staff.branch) {
            return res.status(400).json({ message: "Staff already assigned to a branch" });
        }

        // Add staff to branch
        branch.staffs.push(staff.id);
        await branch.save();

        // Update staff's current branch
        staff.branch = branch.id;
        staff.branchTransferHistory.push({
            toBranch: branch.id,
            transferDate: new Date(),
            transferedBy: addedBy
        });
        await staff.save();

        return res.status(200).json({ message: "Staff added to branch successfully", branch, staff });
    } catch (error: any) {
        return res.status(500).json({ message: "Error adding staff to branch", error: error.message });
    }
};

// Transfer Staff Between Branches
export const transferStaff = async (req: Request, res: Response): Promise<any> => {
    try {
        const { staffId, newBranchId } = req.body;

        // Validate input
        if (!staffId || !newBranchId) {
            return res.status(400).json({ message: "staffId and newBranchId are required" });
        }

        const staff = await Staff.findById(staffId).populate("branch");
        const newBranch = await Branch.findById(newBranchId);

        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        if (!newBranch) {
            return res.status(404).json({ message: "New branch not found" });
        }

        // Check if staff is already in the new branch
        if (staff.branch?.toString() === newBranchId) {
            return res.status(400).json({ message: "Staff is already in this branch" });
        }

        let previousBranchId = null;

        // If staff has a current branch, remove them from it
        if (staff.branch) {
            const previousBranch = await Branch.findById(staff.branch);
            if (previousBranch) {
                previousBranch.staffs = previousBranch.staffs.filter(
                    (id) => id.toString() !== staffId.toString()
                );
                await previousBranch.save();
                previousBranchId = previousBranch._id;
            }
        }

        // Add staff to the new branch
        newBranch.staffs.push(staff.id);
        await newBranch.save();

        // Update staff branch reference and history
        staff.branch = newBranch.id;
        staff.branchTransferHistory.push({
            fromBranch: previousBranchId,
            toBranch: newBranch.id,
            transferDate: new Date(),
        });

        await staff.save();

        return res.status(200).json({
            message: "Staff transferred successfully",
            staff,
        });
    } catch (error) {
        console.error("Error transferring staff:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
