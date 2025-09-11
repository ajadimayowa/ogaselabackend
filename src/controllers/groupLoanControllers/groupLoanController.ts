// controllers/groupController.ts
import { Request, Response } from "express";
import Group from "../../models/Group";
import Member from "../../models/Member";
import mongoose from "mongoose";
import Staff from "../../models/Staff";

/** Create Group (with members from onset) */
export const createGroup = async (req: Request, res: Response): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { groupName, description, createdBy, organizationId, branchId, groupMembers } = req.body;

    const staffIsValid = Staff.findById(createdBy);
    if(!staffIsValid){
      throw new Error("Must be a staff to create.");
    }

    if (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length < 3) {
      throw new Error("Group must have at least 3 member at creation.");
    }

    const seenBVNs = new Set();
    for (const m of groupMembers) {
      if (!m.bvn) {
        return res.status(400).json({
          success: false,
          error: "Each member must have a BVN.",
        });
      }
      if (seenBVNs.has(m.bvn)) {
        return res.status(400).json({
          success: false,
          error: `Duplicate BVN in request body: ${m.bvn}`,
        });
      }
      seenBVNs.add(m.bvn);
    }

    // ✅ 2. Check if BVNs already exist in DB
    const existingMembers = await Member.find({ bvn: { $in: [...seenBVNs] } }).session(session);
    if (existingMembers.length > 0) {
      const existingBVNs = existingMembers.map((m) => m.bvn);
      return res.status(400).json({
        success: false,
        error: `BVN(s) already exist on record`,
        payload: existingBVNs,
      });
    }

    // 1. Create group shell
    const group = await Group.create(
      [
        {
          groupName,
          description,
          createdBy,
          branch: branchId,
          organization: organizationId,
        },
      ],
      { session }
    );

    const groupId = group[0]._id;

    // 2. Create members linked to group
    const newMembers = await Member.insertMany(
      groupMembers.map((m: any) => ({
        ...m,
        group: groupId,
        organization: organizationId,
        branch: branchId,
        createdBy: createdBy
      })),
      { session }
    );

    // 3. Attach member IDs to group
    group[0].groupMembers = newMembers.map((m: any) => m._id);
    await group[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      payload: group[0],
    });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

/** Get Groups (with filters + pagination) */
export const getGroups = async (req: Request, res: Response): Promise<any> => {
  try {
    const { organizationId, createdBy, branchId, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (organizationId) filter.organization = organizationId;
    if (createdBy) filter.createdBy = createdBy;
    if (branchId) filter.branch = branchId;

    const groups = await Group.find(filter)
      .populate("groupMembers")
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Group.countDocuments(filter);

    res.status(200).json({
      success: true,
      payload: groups,
      pagination: {
        total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(total / +limit),
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/** Get Group by ID */
export const getGroupById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate("groupMembers");

    if (!group) return res.status(404).json({ success: false, error: "Group not found" });

    res.json({ success: true, payload: group });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/** Update Group (only non-member info, members handled separately) */
export const updateGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const updates = { ...req.body };
    delete updates.groupMembers; // ❌ prevent accidental overwrite of members here

    const group = await Group.findByIdAndUpdate(req.params.groupId, updates, { new: true });

    if (!group) return res.status(404).json({ success: false, error: "Group not found" });

    res.json({ success: true, message: "Group updated", payload: group });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/** Delete Group (and its members) */
export const deleteGroup = async (req: Request, res: Response): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const group = await Group.findById(req.params.groupId).session(session);

    if (!group) {
      throw new Error("Group not found");
    }

    // Delete associated members
    await Member.deleteMany({ group: group._id }).session(session);

    // Delete group
    await group.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Group and members deleted" });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};
