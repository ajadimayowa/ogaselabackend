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
exports.deleteDepartment = exports.updateDepartment = exports.getDepartmentById = exports.getAllDepartments = exports.getDepartmentsByOrganizationId = exports.createDepartment = exports.a = exports.createAdminDepartment = void 0;
const Department_model_1 = require("../models/Department.model");
const emailTypesHandler_1 = require("../services/email/emailTypesHandler");
const moment_1 = __importDefault(require("moment"));
const Organization_1 = __importDefault(require("../models/Organization"));
const createAdminDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameOfOrg, orgEmail, nameOfDep, organization, createdByName, isApproved, createdById, approvedByName, approvedById, description, creatorId } = req.body;
        // 🔐 Authorization check
        if (creatorId !== process.env.CREATOR_ID) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized Access'
            });
        }
        // 🏢 Check if organization exists
        const orgExists = yield Organization_1.default.findById(organization);
        if (!orgExists) {
            return res.status(400).json({
                success: false,
                message: 'Organization does not exist'
            });
        }
        // 🔁 Check for duplicate department
        const deptExists = yield Department_model_1.Department.findOne({ nameOfDep });
        if (deptExists) {
            return res.status(400).json({
                success: false,
                message: 'Department already exists'
            });
        }
        // ✅ Create department
        const newDept = yield Department_model_1.Department.create({
            nameOfOrg,
            orgEmail,
            nameOfDep,
            organization,
            createdBy: {
                createdByName,
                createdById
            },
            approvedBy: {
                approvedByName,
                approvedById
            },
            isApproved,
            description
        });
        // 📧 Send notification email (non-blocking)
        (0, emailTypesHandler_1.sendDeptCreationEmail)(nameOfOrg, orgEmail, nameOfDep, (0, moment_1.default)().format('DD/MM/YYYY hh:mm A'), createdByName).catch((emailErr) => {
            console.error('Error sending welcome email:', emailErr);
        });
        return res.status(201).json({
            success: true,
            message: 'Department created successfully',
            payload: newDept
        });
    }
    catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            payload: err
        });
    }
});
exports.createAdminDepartment = createAdminDepartment;
const a = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameOfOrg, orgEmail, nameOfDep, organization, createdByName, isApproved, createdById, approvedByName, approvedById, description, creatorId } = req.body;
        if (creatorId != process.env.CREATOR_ID) {
            res.status(401).json({ success: false, message: 'Un Authorised Access' });
        }
        const exists = yield Department_model_1.Department.findOne({ nameOfDep });
        if (exists) {
            res.status(400).json({ success: false, message: 'Department already exists' });
        }
        const dept = yield Department_model_1.Department.create({
            nameOfOrg,
            orgEmail,
            nameOfDep,
            organization,
            createdBy: {
                createdByName,
                createdById
            },
            approvedBy: {
                approvedByName,
                approvedById
            },
            isApproved,
            description,
        });
        // Send welcome email (don't block response if it fails)
        try {
            // (name, email,moment().format('DD/MM/YYYY HH:MM A'));
            yield (0, emailTypesHandler_1.sendDeptCreationEmail)(nameOfOrg, orgEmail, nameOfDep, (0, moment_1.default)().format('DD/MM/YYYY HH:MM A'), createdByName);
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        res.status(201).json({ success: true, message: 'Department Created!', payload: dept });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Error creating department', payload: { see: error } });
    }
});
exports.a = a;
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameOfOrg, orgEmail, nameOfDep, organization, createdByName, isApproved, createdById, approvedByName, approvedById, description, creatorId } = req.body;
        if (creatorId != process.env.CREATOR_ID) {
            res.status(401).json({ success: false, message: 'Un Authorised Access' });
        }
        const exists = yield Department_model_1.Department.findOne({ name });
        if (exists) {
            res.status(400).json({ success: false, message: 'Department already exists' });
        }
        const dept = yield Department_model_1.Department.create({
            nameOfOrg,
            orgEmail,
            nameOfDep,
            organization,
            createdBy: {
                createdByName,
                createdById
            },
            approvedBy: {
                approvedByName,
                approvedById
            },
            isApproved,
            description,
        });
        // Send welcome email (don't block response if it fails)
        try {
            // (name, email,moment().format('DD/MM/YYYY HH:MM A'));
            yield (0, emailTypesHandler_1.sendDeptCreationEmail)(nameOfOrg, orgEmail, nameOfDep, (0, moment_1.default)().format('DD/MM/YYYY HH:MM A'), createdByName);
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        res.status(201).json({ success: true, message: 'Department Created!', payload: dept });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Error creating department', payload: error });
    }
});
exports.createDepartment = createDepartment;
const getDepartmentsByOrganizationId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizationId } = req.params;
        const departments = yield Department_model_1.Department.find({ organization: organizationId });
        if (!departments || departments.length === 0) {
            res.status(404).json({ message: 'No departments found for this organization.' });
        }
        res.status(200).json(departments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching departments by organization ID', error });
    }
});
exports.getDepartmentsByOrganizationId = getDepartmentsByOrganizationId;
const getAllDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield Department_model_1.Department.find().populate('organization');
        res.status(200).json(departments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error });
    }
});
exports.getAllDepartments = getAllDepartments;
const getDepartmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department_model_1.Department.findById(req.params.id).populate('organization');
        if (!department)
            res.status(404).json({ message: 'Department not found' });
        res.status(200).json(department);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching department', error });
    }
});
exports.getDepartmentById = getDepartmentById;
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department_model_1.Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department)
            res.status(404).json({ message: 'Department not found' });
        res.status(200).json(department);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating department', error });
    }
});
exports.updateDepartment = updateDepartment;
const deleteDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department_model_1.Department.findByIdAndDelete(req.params.id);
        if (!department)
            res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ message: 'Department deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting department', error });
    }
});
exports.deleteDepartment = deleteDepartment;
