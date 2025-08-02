import { Request, Response } from 'express';
import Branch from '../../models/Branch';
import Organization from '../../models/Organization';
import { sendBranchCreationEmail, sendOrgWelcomeEmail } from '../../services/email/emailTypesHandler';
import moment from 'moment';

// ✅ Create Branch
export const createBranch = async (req: Request, res: Response):Promise<void> => {
    const {
        nameOfBranch,
        branchManager,
        branchAddress,
        state,
        lga,
        createdByName,
        createdById,
        selectedApprover,
        organization,
        nameOfOrg,
        orgEmail
    } = req.body;

    try {
        const existing = await Branch.findOne({ nameOfBranch, organization });
        if (existing) {
        res.status(400).json({ success: false, message: 'Branch name already exists for this organization' });
        }

        if(!nameOfOrg || !orgEmail){
            res.status(400).json({ success: true, message:'Organisation does not exist!'});
            return ;
        }

        await Branch.create({
            nameOfBranch,
            branchManager:{
                id:branchManager?.id,
                fullName:branchManager?.fullName,
            },
            branchAddress,
            state,
            lga,
            createdByName,
            createdById,
            selectedApprover,
            organization,
        });

        res.status(201).json({ success: true, message:'New branch created succesfully!'});
        try {
            await sendBranchCreationEmail(nameOfOrg,orgEmail,nameOfBranch,moment().format('DD/MM/YYYY HH:MM A'),createdByName)
        } catch (error) {
            
        }
        return;
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating branch', error });
    }
};

// 📥 Get Branches (with optional filters)
export const getBranches = async (req: Request, res: Response) => {
    const { organizationId, isApproved } = req.query;

    const filter: any = {};
    if (organizationId) filter.organization = organizationId;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    try {
        const branches = await Branch.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, payload: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching branches', error });
    }
};

// 🔍 Get Single Branch
export const getBranch = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const branch = await Branch.findById(id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving branch', error });
    }
};

// ✏️ Update Branch
export const updateBranch = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const updated = await Branch.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating branch', error });
    }
};

// ❌ Soft Delete Branch
export const deleteBranch = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deleted = await Branch.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.status(200).json({ success: true, message: 'Branch deleted (soft)', data: deleted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting branch', error });
    }
};

// 🧾 Approve Branch
export const approveBranch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { approvedById, approvedName } = req.body;

    try {
        const approved = await Branch.findByIdAndUpdate(
            id,
            { isApproved: true, approvedById, approvedName },
            { new: true }
        );

        if (!approved) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.status(200).json({ success: true, message: 'Branch approved', data: approved });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error approving branch', error });
    }
};
