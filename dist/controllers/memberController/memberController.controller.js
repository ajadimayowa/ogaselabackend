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
exports.deleteMember = exports.updateMember = exports.getMemberById = exports.getMembers = exports.createMember = void 0;
const Member_1 = __importDefault(require("../../models/Member"));
const Group_1 = __importDefault(require("../../models/Group"));
/** Create Member */
const createMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.create(req.body);
        // update group totals
        const group = yield Group_1.default.findById(member.group);
        // if (group) await group.calculateTotals();
        res.status(201).json({ message: "Member created", member });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.createMember = createMember;
/** Get Members with Filters + Pagination */
const getMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizationId, groupId, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (organizationId)
            filter.organization = organizationId;
        if (groupId)
            filter.group = groupId;
        const members = yield Member_1.default.find(filter)
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        const total = yield Member_1.default.countDocuments(filter);
        res.json({
            data: members,
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
exports.getMembers = getMembers;
/** Get Member by ID */
const getMemberById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.findById(req.params.memberId).populate("group");
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        res.json(member);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.getMemberById = getMemberById;
/** Update Member */
const updateMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.findByIdAndUpdate(req.params.memberId, req.body, { new: true });
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        const group = yield Group_1.default.findById(member.group);
        // if (group) await group.calculateTotals();
        res.json({ message: "Member updated", member });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.updateMember = updateMember;
/** Delete Member */
const deleteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.findByIdAndDelete(req.params.memberId);
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        const group = yield Group_1.default.findById(member.group);
        // if (group) await group.calculateTotals();
        res.json({ message: "Member deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.deleteMember = deleteMember;
