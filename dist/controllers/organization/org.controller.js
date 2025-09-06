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
exports.onboardStaff = exports.deleteOrganization = exports.getOrganizationById = exports.getOrganizations = exports.updateOrganization = exports.createOrganization = void 0;
const Organization_1 = require("../../models/Organization");
const Staff_1 = __importDefault(require("../../models/Staff"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const organization_emailNotifs_1 = require("../../services/email/organization/organization-emailNotifs");
const Creator_model_1 = require("../../models/Creator.model");
const createOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, createdBy, description, email, lga, name, phoneNumber, regNumber, state } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    try {
        const creator = yield Creator_model_1.Creator.findById(createdBy);
        if (!creator) {
            return res.status(404).json({ success: false, message: 'Un Authorized!' });
        }
        // if( !creatorPass || creatorPass !== process.env.CREATOR_PASS){
        //   return res.status(400).json({ success: false, message: 'Un Authorized!' });
        // }
        const exists = yield Organization_1.Organization.findOne({ name: name.trim(), email: email.trim().toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: "Organization already exists" });
        }
        const org = yield Organization_1.Organization.create({
            name: trimmedName,
            email: normalizedEmail,
            address: address.trim(),
            lga,
            state,
            phoneNumber,
            regNumber: regNumber.trim(),
            description,
            createdBy,
        });
        try {
            yield (0, organization_emailNotifs_1.sendOrganizationCreatedEmail)({
                name: org.name,
                regNumber: org.regNumber,
                email: org.email,
                address: org.address,
                lga: org.lga,
                state: org.state,
                phoneNumber: `+234${org.phoneNumber}`,
                createdByName: creator.fullName,
                createdByEmail: creator.email,
                logoUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/PNG+WIZBIZ+LOGO%40200x-8.png',
                footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/wizhub-footer.png'
            });
        }
        catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }
        return res.status(201).json({ success: true, message: 'Organization created', payload: org });
    }
    catch (err) {
        console.error('Error creating organization:', err);
        return res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
});
exports.createOrganization = createOrganization;
const updateOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orgId } = req.params;
        const updateData = req.body;
        const updatedOrg = yield Organization_1.Organization.findByIdAndUpdate(orgId, updateData, {
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
const getOrganizations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Pagination defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filters
        const filter = {};
        // Date created filter
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }
        // Status filter
        if (req.query.isDisabled !== undefined) {
            filter.isDisabled = req.query.isDisabled === 'true';
        }
        if (req.query.isDeleted !== undefined) {
            filter.isDeleted = req.query.isDeleted === 'true';
        }
        // Subscription plan filter
        if (req.query.subscriptionPlan) {
            filter.subscriptionPlan = req.query.subscriptionPlan;
        }
        // Fetch data
        const organizations = yield Organization_1.Organization.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // newest first
        const total = yield Organization_1.Organization.countDocuments(filter);
        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            payload: organizations
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.getOrganizations = getOrganizations;
const getOrganizationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orgId } = req.params;
        const organization = yield Organization_1.Organization.findById(orgId);
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
        const deletedOrg = yield Organization_1.Organization.findByIdAndDelete(orgId);
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
