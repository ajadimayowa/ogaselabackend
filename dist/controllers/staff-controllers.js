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
exports.createStaff = exports.registerSuperAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailTypesHandler_1 = require("../services/email/emailTypesHandler");
const moment_1 = __importDefault(require("moment"));
const Staff_1 = __importDefault(require("../models/Staff"));
const Organization_1 = __importDefault(require("../models/Organization"));
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
exports.createStaff = createStaff;
