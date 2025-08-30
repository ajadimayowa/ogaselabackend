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
exports.getStaffProfileByStaffId = exports.getStaffs = exports.createStaff = exports.registerSuperAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Staff_1 = __importDefault(require("../../models/Staff"));
const Organization_1 = require("../../models/Organization");
const json2csv_1 = require("json2csv");
const mongoose_1 = __importDefault(require("mongoose"));
const staff_emailNotifs_1 = require("../../services/email/staff/staff-emailNotifs");
const Department_model_1 = require("../../models/Department.model");
const Role_1 = __importDefault(require("../../models/Role"));
const Creator_model_1 = require("../../models/Creator.model");
const registerSuperAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, organization, department, role, email, password, homeAddress, lga, state, phoneNumber, createdBy, createdByModel, userClass, staffLevel, description } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = password.trim();
    // console.log({ posted: req.body });
    try {
        const organizationExists = yield Organization_1.Organization.findById(organization);
        if (!organizationExists) {
            return res.status(400).json({ success: false, message: 'Organization does not exist' });
        }
        const creatorExists = yield Creator_model_1.Creator.findById(createdBy);
        if (!creatorExists) {
            return res.status(400).json({ success: false, message: 'Un Authorized!' });
        }
        const deptExists = yield Department_model_1.Department.findById(department);
        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department does not exist' });
        }
        const roleExists = yield Role_1.default.findById(role);
        if (!roleExists) {
            return res.status(400).json({ success: false, message: 'Role not found' });
        }
        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department not found' });
        }
        const existingStaff = yield Staff_1.default.findOne({ email: normalizedEmail, organization });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'User already exists in this organization' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(normalizedPass, 10);
        const firstName = fullName.split(' ')[0];
        const staff = yield Staff_1.default.create({
            fullName,
            firstName,
            organization,
            department,
            roles: [role],
            email: normalizedEmail,
            password: hashedPassword,
            homeAddress,
            lga,
            state,
            phoneNumber,
            userClass,
            staffLevel,
            isSuperAdmin: true,
            createdBy,
            createdByModel,
            description,
        });
        try {
            yield (0, staff_emailNotifs_1.sendStaffCreatedEmail)({
                email: staff.email,
                firstName: staff.firstName,
                password: normalizedPass,
                nameOfOrg: organizationExists.name,
                staffLevel: staff.staffLevel,
                staffRole: roleExists === null || roleExists === void 0 ? void 0 : roleExists.name,
                staffDept: deptExists.name,
                staffClass: staff.userClass,
                logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
                footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
            });
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
});
exports.registerSuperAdmin = registerSuperAdmin;
const createStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, organization, department, role, email, password, homeAddress, lga, state, phoneNumber, createdBy, createdByModel, userClass, staffLevel, description } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = password.trim();
    // console.log({ posted: req.body });
    try {
        const organizationExists = yield Organization_1.Organization.findById(organization);
        if (!organizationExists) {
            return res.status(400).json({ success: false, message: 'Organization does not exist' });
        }
        const staffExists = yield Staff_1.default.findById(createdBy);
        if (!staffExists) {
            return res.status(400).json({ success: false, message: 'Un Authorized!' });
        }
        const deptExists = yield Department_model_1.Department.findById(department);
        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department does not exist' });
        }
        const roleExists = yield Role_1.default.findById(role);
        if (!roleExists) {
            return res.status(400).json({ success: false, message: 'Role not found' });
        }
        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department not found' });
        }
        const existingStaff = yield Staff_1.default.findOne({ email: normalizedEmail, organization });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'User already exists in this organization' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(normalizedPass, 10);
        const firstName = fullName.split(' ')[0];
        const staff = yield Staff_1.default.create({
            fullName,
            firstName,
            organization,
            department,
            roles: [role],
            email: normalizedEmail,
            password: hashedPassword,
            homeAddress,
            lga,
            state,
            phoneNumber,
            userClass,
            staffLevel,
            isSuperAdmin: true,
            createdBy,
            createdByModel,
            description,
        });
        try {
            yield (0, staff_emailNotifs_1.sendStaffCreatedEmail)({
                email: staff.email,
                firstName: staff.firstName,
                password: normalizedPass,
                nameOfOrg: organizationExists.name,
                staffLevel: staff.staffLevel,
                staffRole: roleExists === null || roleExists === void 0 ? void 0 : roleExists.name,
                staffDept: deptExists.name,
                staffClass: staff.userClass,
                logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
                footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
            });
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
});
exports.createStaff = createStaff;
const getStaffs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('Registered models:', mongoose.modelNames());
    try {
        const { organisationId, departmentId, roleId, creationDate, approvalStatus, userClass, staffLevel, search, includeDisabled = 'false', includeDeleted = 'false', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', export: exportType, mode, } = req.query;
        console.log({ hereIsId: organisationId });
        const filter = {};
        // Basic filters
        if (organisationId)
            filter.organization = new mongoose_1.default.Types.ObjectId(organisationId);
        if (departmentId)
            filter.department = departmentId;
        if (roleId)
            filter.roles = roleId;
        if (approvalStatus === 'approved')
            filter.isApproved = true;
        if (approvalStatus === 'pending')
            filter.isApproved = false;
        if (userClass)
            filter.userClass = userClass;
        if (staffLevel)
            filter.staffLevel = staffLevel;
        // Date filter
        if (creationDate) {
            const start = new Date(creationDate);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: start, $lte: end };
        }
        // Search filter
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ fullName: regex }, { email: regex }];
        }
        // Disabled/Deleted filter
        if (includeDisabled === 'false') {
            filter.isDisabled = false;
        }
        if (includeDeleted === 'false') {
            filter.isDeleted = { $ne: true }; // Optional: only if you support soft delete
        }
        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        // Dropdown mode
        if (mode === 'dropdown') {
            const results = yield Staff_1.default.find(filter, 'id fullName').sort(sortOptions);
            return res.status(200).json({ success: true, payload: results });
        }
        // Main query
        const staffs = yield Staff_1.default.find(filter)
            .populate('organization', 'name')
            .populate('branch', 'name')
            .populate('department', 'name')
            .populate('roles', 'title')
            .sort(sortOptions)
            .skip((+page - 1) * +limit)
            .limit(+limit);
        const total = yield Staff_1.default.countDocuments(filter);
        // CSV Export
        if (exportType === 'csv') {
            const plainData = staffs.map((staff) => ({
                fullName: staff.fullName,
                email: staff.email,
                phoneNumber: staff.phoneNumber,
                department: staff.department || '',
                organization: staff.organization || '',
                isApproved: staff.isApproved,
                isDisabled: staff.isDisabled,
                isDeleted: staff.isDeleted || false,
                userClass: staff.userClass,
                staffLevel: staff.staffLevel,
                createdAt: staff.createdAt,
            }));
            const csvFields = [
                'fullName',
                'email',
                'phoneNumber',
                'department',
                'organization',
                'isApproved',
                'isDisabled',
                'isDeleted',
                'userClass',
                'staffLevel',
                'createdAt',
            ];
            const parser = new json2csv_1.Parser({ fields: csvFields });
            const csv = parser.parse(plainData);
            res.header('Content-Type', 'text/csv');
            res.attachment('staffs.csv');
            res.send(csv);
            return;
        }
        // JSON response
        res.status(200).json({
            success: true,
            message: 'Staff list fetched successfully',
            meta: {
                total,
                page: +page,
                limit: +limit,
                totalPages: Math.ceil(total / +limit),
            },
            payload: staffs,
        });
    }
    catch (error) {
        console.error('Error fetching staff list:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            payload: error,
        });
    }
});
exports.getStaffs = getStaffs;
const getStaffProfileByStaffId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({ message: "Invalid staff ID" });
        }
        const staff = yield Staff_1.default.findById(staffId)
            .populate("organization", "name") // only select organization name
            .populate("branch", "name") // customize fields
            .populate("department", "departmentName")
            .populate("roles", "roleName")
            .populate("createdBy", "fullName email")
            .populate("updatedBy", "fullName email")
            .populate("approvedBy", "fullName email")
            .populate("disabledBy", "fullName email")
            .lean();
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        const staffData = {
            id: staff === null || staff === void 0 ? void 0 : staff._id,
            fullName: staff === null || staff === void 0 ? void 0 : staff.fullName,
            branch: staff.branch
                ? staff.branch
                : null,
        };
        return res.status(200).json({
            success: true,
            message: "Staff profile retrieved successfully",
            payload: staffData,
        });
    }
    catch (error) {
        console.error("Error fetching staff profile:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving staff profile",
            error: error.message,
        });
    }
});
exports.getStaffProfileByStaffId = getStaffProfileByStaffId;
