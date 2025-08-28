// controllers/groupController.ts
import { Request, Response } from "express";
import Group from "../../models/Group";

export const createGroup = async (req: Request, res: Response):Promise<any> => {
  try {
    const { groupName, organizationId, branchId, groupMembers} = req.body;

    // ✅ Check if groupName already exists in same branch/org
    const existingGroup = await Group.findOne({ groupName, organizationId, branchId });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists in this branch and organization" });
    }

    // ✅ Check for duplicate BVN across org
    for (const member of groupMembers) {
      const bvnExists = await Group.findOne({
        organizationId,
        "groupMembers.bvn": member.bvn,
      });
      if (bvnExists) {
        return res.status(400).json({ message: `BVN ${member.bvn} already exists in this organization` });
      }
    }

    // ✅ Calculate totals
    const totalAmountBorrowed = groupMembers.reduce((sum:any, m:any) => sum + (m.loanAmount || 0), 0);
    const totalAmountRefunded = groupMembers.reduce((sum:any, m:any) => sum + (m.loanAmount || 0), 0);

    const newGroup = new Group({
      groupName,
      organization:organizationId,
      branch:branchId,
      groupMembers,
      totalAmountBorrowed,
      totalAmountRefunded,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

export const getGroups = async (req: Request, res: Response):Promise<any> => {
  try {
    const groups = await Group.find().populate("organizationId branchId");
    res.status(200).json(groups);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching groups", error: error.message });
  }
};

export const getGroupById = async (req: Request, res: Response):Promise<any> => {
  try {
    const group = await Group.findById(req.params.id).populate("organizationId branchId");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching group", error: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response):Promise<any> => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { groupName, groupMembers } = req.body;

    if (groupName && groupName !== group.groupName) {
      const duplicate = await Group.findOne({ groupName, organizationId: group.organization, branchId: group.branch });
      if (duplicate) return res.status(400).json({ message: "Group name already exists in this branch" });
      group.groupName = groupName;
    }

    if (groupMembers) {
      group.groupMembers = groupMembers;
      group.totalAmountBorrowed = groupMembers.reduce((sum:any, m:any) => sum + (m.amountBorrowed || 0), 0);
      group.totalAmountRefunded = groupMembers.reduce((sum:any, m:any) => sum + (m.amountRefunded || 0), 0);
    }

    await group.save();
    res.status(200).json(group);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating group", error: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response):Promise<any> => {
  try {
    const deleted = await Group.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Group not found" });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting group", error: error.message });
  }
};
