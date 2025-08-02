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
exports.getStaffs = exports.createStaff = exports.registerSuperAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailTypesHandler_1 = require("../services/email/emailTypesHandler");
const moment_1 = __importDefault(require("moment"));
const Staff_1 = __importDefault(require("../models/Staff"));
const Organization_1 = __importDefault(require("../models/Organization"));
const json2csv_1 = require("json2csv");
const mongoose_1 = __importDefault(require("mongoose"));
const registerSuperAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, organization, department, roles, email, password, homeAddress, lga, state, phoneNumber, isApproved, approvedByName, approvedById, approvedByEmail, createdByName, createdByEmail, createdById, userClass, staffLevel, isSuperAdmin, description } = req.body;
    // console.log({ posted: req.body });
    try {
        const organizationExists = yield Organization_1.default.findById(organization);
        if (!organizationExists) {
            res.status(400).json({ success: false, message: 'Organization does not exist' });
            return;
        }
        const existingStaff = yield Staff_1.default.findOne({ organization, email });
        if (existingStaff) {
            res.status(400).json({ success: false, message: 'User already exists in this organization' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const firstName = fullName.split(' ')[0];
        const staff = yield Staff_1.default.create({
            fullName,
            firstName,
            organization,
            department,
            roles,
            email,
            password: hashedPassword,
            homeAddress,
            lga,
            state,
            phoneNumber,
            isApproved,
            userClass,
            staffLevel,
            isSuperAdmin,
            approvedBy: {
                approvedByName,
                approvedById,
            },
            createdBy: {
                createdByName,
                createdById,
            },
            description,
        });
        const emailPayload = {
            firstName,
            loginEmail: email,
            tempPass: password,
            createdByName,
            createdByEmail,
            approvedByName,
            approvedByEmail,
            userClass,
            staffLevel,
            nameOfOrg: organizationExists.nameOfOrg,
            currentTime: (0, moment_1.default)().format('DD/MM/YYYY HH:MM A'),
        };
        try {
            yield (0, emailTypesHandler_1.sendSuperAdminWelcomeEmail)(emailPayload);
        }
        catch (error) {
            console.error('Error sending role creation email:', error);
        }
        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
});
exports.registerSuperAdmin = registerSuperAdmin;
const createStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, phoneNumber, homeAddress, state, lga, description, tempPass, verificationIdType, verificationIdNumber, organization, department, role, createdByName, createdById, userClass, staffLevel, nokFullName, nokHomeAddress, nokState, nokLga, nokPhoneNumber, nokVerificationIdType, nokVerificationIdNumber } = req.body;
    // console.log({ posted: req.body });
    try {
        const organizationExists = yield Organization_1.default.findById(organization);
        if (!organizationExists) {
            res.status(400).json({ success: false, message: 'Organization does not exist' });
            return;
        }
        const existingStaff = yield Staff_1.default.findOne({ organization, email });
        if (existingStaff) {
            res.status(400).json({ success: false, message: 'User already exists in this organization' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(tempPass, 10);
        const firstName = fullName.split(' ')[0];
        const staff = yield Staff_1.default.create({
            fullName,
            firstName,
            organization,
            department,
            roles: role,
            email,
            password: hashedPassword,
            homeAddress,
            lga,
            state,
            phoneNumber,
            userClass,
            staffLevel,
            createdBy: {
                createdByName,
                createdById,
            },
            staffNok: {
                fullName: nokFullName,
                homeAddress: nokHomeAddress,
                lga: nokLga,
                state: nokState,
                nokPhoneNumber: nokPhoneNumber,
                verificationIdType: nokVerificationIdType,
                verificationIdNumber: nokVerificationIdNumber
            },
            staffKyc: {
                verificationIdType: verificationIdType,
                verificationIdNumber: verificationIdNumber
            },
            description,
        });
        const emailPayload = {
            firstName,
            loginEmail: email,
            tempPass: tempPass,
            userClass,
            staffLevel,
            nameOfOrg: organizationExists.nameOfOrg,
            currentTime: (0, moment_1.default)().format('DD/MM/YYYY HH:MM A'),
        };
        try {
            yield (0, emailTypesHandler_1.sendStaffWelcomeEmail)(emailPayload);
        }
        catch (error) {
            console.error('Error sending role creation email:', error);
        }
        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
        return;
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
        return;
    }
});
exports.createStaff = createStaff;
const getStaffs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Registered models:', mongoose_1.default.modelNames());
    try {
        const { organisationId, departmentId, roleId, creationDate, approvalStatus, userClass, staffLevel, search, includeDisabled = 'false', includeDeleted = 'false', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', export: exportType, mode, } = req.query;
        const filter = {};
        // Basic filters
        if (organisationId)
            filter.Organizations = organisationId;
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
            const results = yield Staff_1.default.find(filter, '_id fullName').sort(sortOptions);
            res.status(200).json({ success: true, payload: results });
            return;
        }
        // Main query
        const staffs = yield Staff_1.default.find(filter)
            .populate('organization', 'nameOfOrg', 'Organizations')
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
