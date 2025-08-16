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
exports.deleteDepartment = exports.getDepartmentById = exports.getAllDepartments = exports.getDepartmentsByOrganizationId = exports.updateDepartment = exports.getSingleDeptById = exports.getDepartments = exports.createDepartment = exports.createAdminDepartment = void 0;
const Department_model_1 = require("../models/Department.model");
const Organization_1 = require("../models/Organization");
const Creator_model_1 = require("../models/Creator.model");
const organization_emailNotifs_1 = require("../services/email/organization/organization-emailNotifs");
const mongoose_1 = __importDefault(require("mongoose"));
const Staff_1 = __importDefault(require("../models/Staff"));
const createAdminDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, organizationId, createdById, description, createdByModel } = req.body;
    try {
        const creatorExist = yield Creator_model_1.Creator.findById(createdById);
        if (!creatorExist) {
            return res.status(400).json({
                success: false,
                message: 'Un Authorized Access'
            });
        }
        const isDuplicate = yield Department_model_1.Department.findOne({ name, organization: organizationId });
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                message: 'Department already exists'
            });
        }
        // 🏢 Check if organization exists
        const orgExists = yield Organization_1.Organization.findById(organizationId);
        if (!orgExists) {
            return res.status(400).json({
                success: false,
                message: 'Organization does not exist'
            });
        }
        yield Organization_1.Organization.create({
            name,
            organizationId,
            createdBy: createdById,
            createdByModel,
            description,
        });
        yield (0, organization_emailNotifs_1.sendOrgDeptCreationEmail)({
            nameOfDept: name,
            nameOfOrg: orgExists.name,
            orgEmail: orgExists.email,
            createdByName: creatorExist.fullName,
            createdByEmail: creatorExist.email,
            orgPrimaryColor: orgExists.primaryColor || '#ffffff',
            logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
            footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
        });
        return res.status(201).json({
            success: true,
            message: 'Department created successfully',
            payload: {}
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
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nameOfDept, organizationId, createdBy, description, createdByModel } = req.body;
    try {
        let userExist = yield Creator_model_1.Creator.findById(createdBy);
        if (!userExist) {
            userExist = yield Staff_1.default.findById(createdBy);
        }
        if (!userExist) {
            return res.status(400).json({ success: false, message: 'Un Authorized Access' });
        }
        const orgExist = yield Organization_1.Organization.findById(organizationId);
        if (!orgExist) {
            res.status(400).json({ success: false, message: 'Un Authorized Access' });
            return res.json({ success: false, message: 'Un Authorized Access' });
        }
        const exists = yield Department_model_1.Department.findOne({ nameOfDept, organization: organizationId });
        if (exists) {
            res.status(400).json({ success: false, message: 'Department already exists' });
            return;
        }
        yield Department_model_1.Department.create({
            name: nameOfDept,
            organization: organizationId,
            createdBy,
            createdByModel,
            description,
        });
        try {
            yield (0, organization_emailNotifs_1.sendOrgDeptCreationEmail)({
                nameOfDept,
                createdByName: userExist.fullName,
                createdByEmail: userExist.email,
                nameOfOrg: orgExist.name,
                orgEmail: orgExist.email,
                logoUrl: 'https://wok9jamedia.s3.eu-north-1.amazonaws.com/fsh-logo+(1).png',
                footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/fsh-email-temp-footer.png'
            });
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        res.status(201).json({ success: true, message: 'Department Created!', payload: {} });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Error creating department', payload: error });
    }
});
exports.createDepartment = createDepartment;
const getDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page = "1", limit = "10", organizationId, searchByName, statusOf, } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        if (!organizationId || !mongoose_1.default.Types.ObjectId.isValid(organizationId)) {
            return res.status(400).json({
                success: false,
                message: "Valid organizationId is required",
            });
        }
        // Build filters with proper ObjectId
        const filters = {
            organization: new mongoose_1.default.Types.ObjectId(organizationId),
        };
        if (searchByName) {
            filters.name = { $regex: searchByName, $options: "i" };
        }
        if (statusOf !== undefined) {
            filters.isApproved = statusOf === "true";
        }
        const [departments, total] = yield Promise.all([
            Department_model_1.Department.find(filters)
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Department_model_1.Department.countDocuments(filters),
        ]);
        // let filteredDept = departments.map((dept)=>dept.name!=='S')
        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            payload: departments,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error,
        });
    }
});
exports.getDepartments = getDepartments;
const getSingleDeptById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid department ID" });
        }
        const department = yield Department_model_1.Department.findById(id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        return res.status(200).json({ success: true, message: "Department fetched", data: department });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error });
    }
});
exports.getSingleDeptById = getSingleDeptById;
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid department ID" });
        }
        const department = yield Department_model_1.Department.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        return res.status(200).json({ success: true, message: "Department updated", data: department });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error });
    }
});
exports.updateDepartment = updateDepartment;
const getDepartmentsByOrganizationId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizationId } = req.params;
        const departments = yield Department_model_1.Department.find({ organization: organizationId });
        if (!departments || departments.length === 0) {
            res.status(404).json({ message: 'No departments found for this organization.' });
        }
        let depts = departments.map((depts) => ({
            value: depts._id,
            label: depts.name
        }));
        res.status(200).json({ success: true, payload: depts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching departments by organization ID', payload: error });
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
