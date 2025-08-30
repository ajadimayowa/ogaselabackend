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
const mongoose_1 = __importDefault(require("mongoose"));
const Member_1 = __importDefault(require("../../models/Member"));
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { groupName, description, createdBy, organizationId, branchId, groupMembers } = req.body;
        // 1. Create group
        const group = yield Group_1.default.create([{ groupName, description, createdBy, branch: branchId, organization: organizationId }], { session });
        // console.log({seeGroup:group})
        const groupId = group[0]._id;
        // 2. Create members and link to group
        const newMembers = yield Member_1.default.insertMany(groupMembers.map((m) => (Object.assign(Object.assign({}, m), { group: groupId, organization: organizationId, branch: branchId, totalAmountBorrowed: m.loanAmount || 0 }))), { session });
        // console.log({seeTHem:newMembers})
        // 3. Update group with member IDs
        group[0].groupMembers = newMembers.map((m) => m._id);
        group[0].totalAmountBorrowed = newMembers.reduce((sum, m) => sum + (m.totalAmountBorrowed || 20000), 0);
        yield group[0].save({ session });
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: "Group created successfully", group: group[0] });
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: err.message });
    }
});
exports.createGroup = createGroup;
/** Get Groups with Filters + Pagination */
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizationId, createdBy, branchId, status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (organizationId)
            filter.organization = organizationId;
        if (createdBy)
            filter.createdBy = createdBy;
        if (branchId)
            filter.branch = branchId;
        if (status)
            filter.status = status;
        const groups = yield Group_1.default.find(filter)
            .populate("groupMembers")
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        const total = yield Group_1.default.countDocuments(filter);
        res.status(200).json({
            data: groups,
            pagination: {
                total,
                page: +page,
                limit: +limit,
                totalPages: Math.ceil(total / +limit),
            },
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.getGroups = getGroups;
const getGroupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const group = yield Group_1.default.findById(id).populate("groupMembers");
        if (!group)
            return res.status(404).json({ error: "Group not found" });
        res.json(group);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.getGroupById = getGroupById;
/** Update Group */
const updateGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const group = yield Group_1.default.findByIdAndUpdate(req.params.groupId, req.body, { new: true });
        if (!group)
            return res.status(404).json({ error: "Group not found" });
        res.json({ message: "Group updated", group });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.updateGroup = updateGroup;
/** Delete Group */
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const group = yield Group_1.default.findByIdAndDelete(req.params.groupId);
        if (!group)
            return res.status(404).json({ error: "Group not found" });
        yield Member_1.default.deleteMany({ group: group._id }); // cleanup members
        res.json({ message: "Group deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.deleteGroup = deleteGroup;
