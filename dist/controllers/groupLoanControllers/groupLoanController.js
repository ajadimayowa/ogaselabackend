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
exports.deleteGroup = exports.updateGroup = exports.getGroupById = exports.getGroups = exports.createGroup = void 0;
const Group_1 = __importDefault(require("../../models/Group"));
const Member_1 = __importDefault(require("../../models/Member"));
const mongoose_1 = __importDefault(require("mongoose"));
const Staff_1 = __importDefault(require("../../models/Staff"));
/** Create Group (with members from onset) */
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { groupName, description, createdBy, organizationId, branchId, groupMembers } = req.body;
        const staffIsValid = Staff_1.default.findById(createdBy);
        if (!staffIsValid) {
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
        const existingMembers = yield Member_1.default.find({ bvn: { $in: [...seenBVNs] } }).session(session);
        if (existingMembers.length > 0) {
            const existingBVNs = existingMembers.map((m) => m.bvn);
            return res.status(400).json({
                success: false,
                error: `BVN(s) already exist on record`,
                payload: existingBVNs,
            });
        }
        // 1. Create group shell
        const group = yield Group_1.default.create([
            {
                groupName,
                description,
                createdBy,
                branch: branchId,
                organization: organizationId,
            },
        ], { session });
        const groupId = group[0]._id;
        // 2. Create members linked to group
        const newMembers = yield Member_1.default.insertMany(groupMembers.map((m) => (Object.assign(Object.assign({}, m), { group: groupId, organization: organizationId, branch: branchId, createdBy: createdBy }))), { session });
        // 3. Attach member IDs to group
        group[0].groupMembers = newMembers.map((m) => m._id);
        yield group[0].save({ session });
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: "Group created successfully",
            payload: group[0],
        });
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.createGroup = createGroup;
/** Get Groups (with filters + pagination) */
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizationId, createdBy, branchId, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (organizationId)
            filter.organization = organizationId;
        if (createdBy)
            filter.createdBy = createdBy;
        if (branchId)
            filter.branch = branchId;
        const groups = yield Group_1.default.find(filter)
            .populate("groupMembers")
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        const total = yield Group_1.default.countDocuments(filter);
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
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.getGroups = getGroups;
/** Get Group by ID */
const getGroupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const group = yield Group_1.default.findById(id).populate("groupMembers");
        if (!group)
            return res.status(404).json({ success: false, error: "Group not found" });
        res.json({ success: true, payload: group });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.getGroupById = getGroupById;
/** Update Group (only non-member info, members handled separately) */
const updateGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updates = Object.assign({}, req.body);
        delete updates.groupMembers; // ❌ prevent accidental overwrite of members here
        const group = yield Group_1.default.findByIdAndUpdate(req.params.groupId, updates, { new: true });
        if (!group)
            return res.status(404).json({ success: false, error: "Group not found" });
        res.json({ success: true, message: "Group updated", payload: group });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.updateGroup = updateGroup;
/** Delete Group (and its members) */
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const group = yield Group_1.default.findById(req.params.groupId).session(session);
        if (!group) {
            throw new Error("Group not found");
        }
        // Delete associated members
        yield Member_1.default.deleteMany({ group: group._id }).session(session);
        // Delete group
        yield group.deleteOne({ session });
        yield session.commitTransaction();
        session.endSession();
        res.json({ success: true, message: "Group and members deleted" });
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.deleteGroup = deleteGroup;
