// controllers/groupController.ts
import { Request, Response } from "express";
import Group from "../../models/Group";
import mongoose from "mongoose";
import Member from "../../models/Member";

export const createGroup = async (req: Request, res: Response):Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { groupName, description, createdBy, organizationId,branchId, groupMembers } = req.body;

    // 1. Create group
    const group = await Group.create(
      [{ groupName, description, createdBy,branch:branchId, organization:organizationId }],
      { session }
    );

    // console.log({seeGroup:group})
    const groupId = group[0]._id;

    // 2. Create members and link to group
    const newMembers = await Member.insertMany(
     groupMembers.map((m: any) => ({
        ...m,
        group: groupId,
        organization:organizationId,
        branch:branchId,
        totalAmountBorrowed: m.loanAmount || 0,
      })),
      { session }
    );

    // console.log({seeTHem:newMembers})

    // 3. Update group with member IDs
    group[0].groupMembers = newMembers.map((m) => m._id);
    group[0].totalAmountBorrowed = newMembers.reduce((sum: number, m: any) => sum + (m.totalAmountBorrowed || 20000), 0);
    await group[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Group created successfully", group: group[0] });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

/** Get Groups with Filters + Pagination */
export const getGroups = async (req: Request, res: Response):Promise<any>  => {
  try {
    const { organizationId, createdBy, branchId, status, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (organizationId) filter.organization = organizationId;
    if (createdBy) filter.createdBy = createdBy;
    if (branchId) filter.branch = branchId;
    if (status) filter.status = status;

    const groups = await Group.find(filter)
      .populate("groupMembers")
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Group.countDocuments(filter);

    res.status(200).json({
      data: groups,
      pagination: {
        total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(total / +limit),
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getGroupById = async (req: Request, res: Response):Promise<any>  => {
  const {id} = req.params
  try {
    const group = await Group.findById(id).populate("groupMembers");
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** Update Group */
export const updateGroup = async (req: Request, res: Response):Promise<any>  => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.groupId, req.body, { new: true });
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json({ message: "Group updated", group });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** Delete Group */
export const deleteGroup = async (req: Request, res: Response):Promise<any>  => {
  try {
    const group = await Group.findByIdAndDelete(req.params.groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    await Member.deleteMany({ group: group._id }); // cleanup members
    res.json({ message: "Group deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
