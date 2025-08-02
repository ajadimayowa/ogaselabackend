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
exports.getRolesByDepartment = exports.createRole = exports.createSuperAdminRole = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const emailTypesHandler_1 = require("../services/email/emailTypesHandler");
const moment_1 = __importDefault(require("moment"));
const Organization_1 = __importDefault(require("../models/Organization"));
const createSuperAdminRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleName, roleDepartment, organization, rolePermissions, roleCreatedByName, roleCreatedById, approvedByName, isApproved, approvedById, isDisabled, roleDescription, creatorPass } = req.body;
    // console.log({ sent: req.body });
    try {
        const organizationExists = yield Organization_1.default.findById(organization);
        if (!organizationExists) {
            res.status(400).json({ success: false, message: 'Organization does not exist' });
            return;
        }
        const exists = yield Role_1.default.findOne({ roleName, roleDepartment });
        if (exists) {
            res.status(400).json({ success: false, message: 'Role already exists' });
            return;
        }
        const role = yield Role_1.default.create({
            roleName,
            roleDepartment,
            organization,
            rolePermissions,
            roleCreatedBy: {
                roleCreatedByName,
                roleCreatedById,
            },
            approvedBy: {
                approvedByName,
                approvedById,
            },
            isApproved,
            isDisabled,
            roleDescription,
        });
        const props = {
            nameOfOrg: organizationExists.nameOfOrg,
            orgEmail: organizationExists.orgEmail, // You can set the organization's email here
            nameOfRole: roleName,
            currentTime: (0, moment_1.default)().format('DD/MM/YYYY HH:MM A')
        };
        try {
            yield (0, emailTypesHandler_1.sendRoleCreationEmail)(props);
        }
        catch (error) {
            console.error('Error sending role creation email:', error);
        }
        res.status(201).json({ success: true, message: 'Role Created!', payload: role });
    }
    catch (err) {
        res.status(500).json({ success: true, message: 'Failed tp create role', payload: err });
    }
});
exports.createSuperAdminRole = createSuperAdminRole;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization, roleDepartment, roleName, rolePermission, roleCreatedByName, roleCreatedById, roleDescription, } = req.body;
        console.log({ received: req.body });
        // Check if organization exists
        const organizationExists = yield Organization_1.default.findById(organization);
        if (!organizationExists) {
            res.status(400).json({ success: false, message: 'Organization does not exist' });
            return;
        }
        // Check if role with same name and department already exists
        const existingRole = yield Role_1.default.findOne({ roleName, roleDepartment });
        if (existingRole) {
            res.status(400).json({ success: false, message: 'Role already exists' });
            return;
        }
        // Construct the new role
        const newRoleData = {
            roleName,
            roleDepartment,
            organization,
            rolePermissions: rolePermission ? [rolePermission] : [],
            roleCreatedBy: {
                roleCreatedById,
                roleCreatedByName
            },
            roleDescription,
        };
        const role = yield Role_1.default.create(newRoleData);
        // Prepare email props
        const props = {
            nameOfOrg: organizationExists.nameOfOrg,
            orgEmail: organizationExists.orgEmail,
            nameOfRole: roleName,
            currentTime: (0, moment_1.default)().format('DD/MM/YYYY hh:mm A'),
        };
        // Send role creation email (non-blocking)
        (0, emailTypesHandler_1.sendRoleCreationEmail)(props).catch(err => {
            console.error('Error sending role creation email:', err);
        });
        res.status(201).json({ success: true, message: 'Role created successfully', payload: role });
        return;
    }
    catch (err) {
        console.error('Error creating role:', err);
        res.status(500).json({ success: false, message: 'Failed to create role', payload: err });
        return;
    }
});
exports.createRole = createRole;
const getRolesByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { departmentId } = req.params;
    try {
        const roles = yield Role_1.default.find({ roleDepartment: departmentId });
        let roleData = roles.map((role) => ({
            value: role._id,
            label: role.roleName
        }));
        res.status(200).json({ success: true, payload: roleData });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch roles', payload: err });
    }
});
exports.getRolesByDepartment = getRolesByDepartment;
