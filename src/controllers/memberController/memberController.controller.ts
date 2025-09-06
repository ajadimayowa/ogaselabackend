// controllers/memberController.ts
import { Request, Response } from "express";
import Member from "../../models/Member";
import Group from "../../models/Group";

/** Create Member */
export const createMember = async (req: Request, res: Response) => {
  try {
    const member = await Member.create(req.body);

    // update group totals
    const group = await Group.findById(member.group);
    // if (group) await group.calculateTotals();

    res.status(201).json({ message: "Member created", member });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** Get Members with Filters + Pagination */
export const getMembers = async (req: Request, res: Response) => {
  try {
    const { organizationId, groupId, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (organizationId) filter.organization = organizationId;
    if (groupId) filter.group = groupId;

    const members = await Member.find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments(filter);

    res.json({
      data: members,
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

/** Get Member by ID */
export const getMemberById = async (req: Request, res: Response):Promise<any>=> {
  try {
    const member = await Member.findById(req.params.id).populate("group");
    if (!member) return res.status(404).json({ error: "Member not found" });
    return res.status(201).json({success:true,payload:member,message:'success'});
  } catch (err: any) {
   return  res.status(400).json({ error: err.message });
  }
};

/** Update Member */
export const updateMember = async (req: Request, res: Response):Promise<any> => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.memberId, req.body, { new: true });
    if (!member) return res.status(404).json({ error: "Member not found" });

    const group = await Group.findById(member.group);
    // if (group) await group.calculateTotals();

   return  res.json({ message: "Member updated", member });
  } catch (err: any) {
   return  res.status(400).json({ error: err.message });
  }
};

/** Delete Member */
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const group = await Group.findById(member.group);
    // if (group) await group.calculateTotals();

    res.json({ message: "Member deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
