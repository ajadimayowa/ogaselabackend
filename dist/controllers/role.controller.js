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
exports.getRolesByDepartment = exports.getRolesController = exports.createRole = exports.createSuperAdminRole = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const Organization_1 = require("../models/Organization");
const createSuperAdminRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization, department, name, createdBy, createdByModel, description, } = req.body;
        console.log({ received: req.body });
        // Check if organization exists
        const organizationExists = yield Organization_1.Organization.findById(organization);
        if (!organizationExists) {
            return res.status(400).json({ success: false, message: 'Organization does not exist' });
        }
        // Check if role with same name and department already exists
        const existingRole = yield Role_1.default.findOne({ name, department, organization });
        if (existingRole) {
            return res.status(400).json({ success: false, message: 'Role already exists' });
        }
        const role = yield Role_1.default.create({
            name: name.trim(),
            department,
            organization,
            createdBy,
            createdByModel,
            permissions: ['all.access'],
            description
        });
        return res.status(201).json({ success: true, message: 'Role created successfully', payload: role });
    }
    catch (err) {
        console.error('Error creating role:', err);
        return res.status(500).json({ success: false, message: 'Failed to create role', payload: err });
    }
});
exports.createSuperAdminRole = createSuperAdminRole;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization, department, name, createdBy, createdByModel, description, } = req.body;
        console.log({ received: req.body });
        // Check if organization exists
        const organizationExists = yield Organization_1.Organization.findById(organization);
        if (!organizationExists) {
            return res.status(400).json({ success: false, message: 'Organization does not exist' });
        }
        // Check if role with same name and department already exists
        const existingRole = yield Role_1.default.findOne({ name, department, organization });
        if (existingRole) {
            return res.status(400).json({ success: false, message: 'Role already exists' });
        }
        const role = yield Role_1.default.create({
            name: name.trim(),
            department,
            organization,
            createdBy,
            createdByModel,
            permissions: [],
            description
        });
        return res.status(201).json({ success: true, message: 'Role created successfully', payload: role });
    }
    catch (err) {
        console.error('Error creating role:', err);
        return res.status(500).json({ success: false, message: 'Failed to create role', payload: err });
    }
});
exports.createRole = createRole;
const getRolesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { departmentId, organizationId, status, page = 1, limit = 10 } = req.query;
        // Build filter object
        const filter = {};
        if (departmentId)
            filter.department = departmentId;
        if (organizationId)
            filter.organization = organizationId;
        if (status)
            filter.status = status; // Assuming `status` is a field in your Role schema
        // Pagination calculations
        const pageNumber = parseInt(page, 10);
        const pageLimit = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageLimit;
        // Query database
        const [roles, total] = yield Promise.all([
            Role_1.default.find(filter)
                .populate('department')
                .populate('organization')
                .skip(skip)
                .limit(pageLimit)
                .sort({ createdAt: -1 }), // latest first
            Role_1.default.countDocuments(filter)
        ]);
        return res.status(200).json({
            success: true,
            message: 'Roles fetched successfully',
            payload: {
                data: roles,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: pageLimit,
                    totalPages: Math.ceil(total / pageLimit)
                }
            }
        });
    }
    catch (err) {
        console.error('Error fetching roles:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            payload: err
        });
    }
});
exports.getRolesController = getRolesController;
const getRolesByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { departmentId } = req.params;
    try {
        const roles = yield Role_1.default.find({ roleDepartment: departmentId });
        let roleData = roles.map((role) => ({
            value: role._id,
            label: role.name
        }));
        return res.status(200).json({ success: true, payload: roleData });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch roles', payload: err });
    }
});
exports.getRolesByDepartment = getRolesByDepartment;
