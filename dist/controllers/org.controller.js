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
exports.onboardStaff = exports.deleteOrganization = exports.getOrganizationById = exports.updateOrganization = exports.createOrganization = void 0;
const Organization_1 = __importDefault(require("../models/Organization"));
const Staff_1 = __importDefault(require("../models/Staff"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailTypesHandler_1 = require("../services/email/emailTypesHandler");
const moment_1 = __importDefault(require("moment"));
const createOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { creatorPass, nameOfOrg, orgEmail, orgAddress, orgLga, orgState, orgPhoneNumber, orgSubscriptionPlan, orgRegNumber, createdByEmail, createdByName } = req.body;
        if (!creatorPass || creatorPass !== process.env.CREATOR_PASS) {
            return res.status(400).json({ success: false, message: 'Un Authorized!' });
        }
        const exists = yield Organization_1.default.findOne({ orgEmail });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Organization already exists' });
        }
        const org = yield Organization_1.default.create({
            nameOfOrg,
            orgEmail,
            orgAddress,
            orgLga,
            orgState,
            orgPhoneNumber,
            orgSubscriptionPlan,
            orgRegNumber,
            createdByName,
            createdByEmail
        });
        const orgEmailPayload = {
            nameOfOrg: org.nameOfOrg,
            orgEmail: org.orgEmail,
            orgAddress: org.orgAddress,
            orgPhoneNumber: org.orgPhoneNumber,
            orgSubscriptionPlan: org.orgSubscriptionPlan,
            orgRegNumber: org.orgRegNumber,
            organisationLogo: org.organisationLogo,
            organisationPrimaryColor: org.organisationPrimaryColor,
            organisationSecondaryColor: org.organisationSecondaryColor,
            currentTime: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss'),
            createdByName: 'System'
        };
        // Send welcome email (don't block response if it fails)
        try {
            yield (0, emailTypesHandler_1.sendOrgWelcomeEmail)(orgEmailPayload);
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        return res.status(201).json({ success: true, message: 'Organization created', payload: org });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
});
exports.createOrganization = createOrganization;
const updateOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orgId } = req.params;
        const updateData = req.body;
        const updatedOrg = yield Organization_1.default.findByIdAndUpdate(orgId, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedOrg) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        return res.status(200).json({ success: true, message: 'Organization updated', payload: updatedOrg });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.updateOrganization = updateOrganization;
const getOrganizationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orgId } = req.params;
        const organization = yield Organization_1.default.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        return res.status(200).json({ success: true, message: 'Organization found', payload: organization });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.getOrganizationById = getOrganizationById;
const deleteOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orgId } = req.params;
        const deletedOrg = yield Organization_1.default.findByIdAndDelete(orgId);
        if (!deletedOrg) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        return res.status(200).json({ success: true, message: 'Organization deleted', payload: deletedOrg });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.deleteOrganization = deleteOrganization;
const onboardStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password, organizationId, department, roles } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const staff = new Staff_1.default({
            fullName,
            email,
            password: hashedPassword,
            organization: organizationId,
            department,
            roles,
            isSuperAdmin: false
        });
        yield staff.save();
        res.status(201).json({ msg: 'Staff onboarded', staff });
    }
    catch (err) {
        // next(err);
        res.status(500).json({ msg: 'Error onboarding staff' });
    }
});
exports.onboardStaff = onboardStaff;
