import { Request, Response } from "express";
import User, { IStaff } from "../models/Staff";
import bcrypt from 'bcryptjs';
import { sendStaffWelcomeEmail, sendSuperAdminWelcomeEmail } from "../services/email/emailTypesHandler";
import moment from "moment";
import { IStaffCreationEmail, ISuperAdminCreationEmail } from "../interfaces/email";
import Staff from "../models/Staff";
import Organization from "../models/Organization";
import { Parser } from 'json2csv';
import mongoose from "mongoose";




export const registerSuperAdmin = async (req: Request, res: Response) => {
    const {
        fullName,
        organization,
        department,
        roles,
        email,
        password,
        homeAddress,
        lga,
        state,
        phoneNumber,
        isApproved,
        approvedByName,
        approvedById,
        approvedByEmail,
        createdByName,
        createdByEmail,
        createdById,
        userClass,
        staffLevel,
        isSuperAdmin,
        description

    } = req.body;

    // console.log({ posted: req.body });
    try {
        const organizationExists = await Organization.findById(organization);
        if (!organizationExists) {
            res.status(400).json({ success: false, message: 'Organization does not exist' });
            return;
        }
        const existingStaff = await Staff.findOne({ organization, email });
        if (existingStaff) {
            res.status(400).json({ success: false, message: 'User already exists in this organization' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const firstName = fullName.split(' ')[0];

        const staff = await Staff.create({
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


        const emailPayload: ISuperAdminCreationEmail = {
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
            currentTime: moment().format('DD/MM/YYYY HH:MM A'),
        }

        try {
            await sendSuperAdminWelcomeEmail(emailPayload)
        } catch (error) {
            console.error('Error sending role creation email:', error);

        }


        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
};


export const createStaff = async (req: Request, res: Response) => {
    const {
        fullName,
        email,
        phoneNumber,
        homeAddress,
        state,
        lga,
        description,
        tempPass,

        verificationIdType,
        verificationIdNumber,

        organization,
        department,
        role,

        createdByName,
        createdById,

        userClass,
        staffLevel,

        nokFullName,
        nokHomeAddress,
        nokState,
        nokLga,
        nokPhoneNumber,
        nokVerificationIdType,
        nokVerificationIdNumber

    } = req.body;

    // console.log({ posted: req.body });
    try {
        const organizationExists = await Organization.findById(organization);
        if (!organizationExists) {
            res.status(400).json({ success: false, message: 'Organization does not exist' });
            return;
        }
        const existingStaff = await Staff.findOne({ organization, email });
        if (existingStaff) {
            res.status(400).json({ success: false, message: 'User already exists in this organization' });
            return;
        }

        const hashedPassword = await bcrypt.hash(tempPass, 10);
        const firstName = fullName.split(' ')[0];

        const staff = await Staff.create({
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
                verificationIdType:verificationIdType,
                verificationIdNumber: verificationIdNumber
            },
            description,
        });


        const emailPayload: IStaffCreationEmail = {
            firstName,
            loginEmail: email,
            tempPass: tempPass,
            userClass,
            staffLevel,
            nameOfOrg: organizationExists.nameOfOrg,
            currentTime: moment().format('DD/MM/YYYY HH:MM A'),
        }

        try {
            await sendStaffWelcomeEmail(emailPayload)
        } catch (error) {
            console.error('Error sending role creation email:', error);

        }


        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
        return ;
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
        return ;
    }
};

export const getStaffs = async (req: Request, res: Response) => {
    console.log('Registered models:', mongoose.modelNames());
    try {
        const {
            organisationId,
            departmentId,
            roleId,
            creationDate,
            approvalStatus,
            userClass,
            staffLevel,
            search,
            includeDisabled = 'false',
            includeDeleted = 'false',
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            export: exportType,
            mode,
        } = req.query;

        const filter: any = {};

        // Basic filters
        if (organisationId) filter.Organizations = organisationId;
        if (departmentId) filter.department = departmentId;
        if (roleId) filter.roles = roleId;
        if (approvalStatus === 'approved') filter.isApproved = true;
        if (approvalStatus === 'pending') filter.isApproved = false;
        if (userClass) filter.userClass = userClass;
        if (staffLevel) filter.staffLevel = staffLevel;

        // Date filter
        if (creationDate) {
            const start = new Date(creationDate as string);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: start, $lte: end };
        }

        // Search filter
        if (search) {
            const regex = new RegExp(search as string, 'i');
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
        const sortOptions: any = {};
        sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Dropdown mode
        if (mode === 'dropdown') {
            const results = await Staff.find(filter, '_id fullName').sort(sortOptions);
            res.status(200).json({ success: true, payload: results });
            return;
        }

        // Main query
        const staffs = await Staff.find(filter)
            .populate('organization', 'nameOfOrg', 'Organizations')
            .populate('department', 'name')
            .populate('roles', 'title')
            .sort(sortOptions)
            .skip((+page - 1) * +limit)
            .limit(+limit);

        const total = await Staff.countDocuments(filter);

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
                isDeleted: (staff as any).isDeleted || false,
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

            const parser = new Parser({ fields: csvFields });
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
    } catch (error) {
        console.error('Error fetching staff list:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            payload: error,
        });
    }
};


