import { Request, Response } from "express";
import User, { IStaff } from "../../models/Staff";
import bcrypt from 'bcryptjs';
import { sendStaffWelcomeEmail, sendSuperAdminWelcomeEmail } from "../../services/email/emailTypesHandler";
import moment from "moment";
import { IStaffCreationEmail, ISuperAdminCreationEmail } from "../../interfaces/email";
import Staff from "../../models/Staff";
import { Organization } from "../../models/Organization";
import { Parser } from 'json2csv';
import mongoose from "mongoose";
import { sendStaffCreatedEmail } from "../../services/email/staff/staff-emailNotifs";
import { Department } from "../../models/Department.model";
import Role from "../../models/Role";
import { Creator } from "../../models/Creator.model";




export const registerSuperAdmin = async (req: Request, res: Response): Promise<any> => {
    const {
        fullName,
        organization,
        department,
        role,
        email,
        password,
        homeAddress,
        lga,
        state,
        phoneNumber,
        createdBy,
        createdByModel,
        userClass,
        staffLevel,
        description

    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = password.trim();
    // console.log({ posted: req.body });
    try {
        const organizationExists = await Organization.findById(organization);
        if (!organizationExists) {
            return res.status(400).json({ success: false, message: 'Organization does not exist' });

        }

        const creatorExists = await Creator.findById(createdBy);
        if (!creatorExists) {
            return res.status(400).json({ success: false, message: 'Un Authorized!' });

        }

        const deptExists = await Department.findById(department);
        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department does not exist' });

        }
        const roleExists = await Role.findById(role);
        if (!roleExists) {
            return res.status(400).json({ success: false, message: 'Role not found' });
        }

        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department not found' });

        }
        const existingStaff = await Staff.findOne({ email: normalizedEmail, organization });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'User already exists in this organization' });

        }

        const hashedPassword = await bcrypt.hash(normalizedPass, 10);
        const firstName = fullName.split(' ')[0];

        const staff = await Staff.create({
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
            await sendStaffCreatedEmail({
                email: staff.email,
                firstName: staff.firstName,
                password: normalizedPass,
                nameOfOrg: organizationExists.name,
                staffLevel: staff.staffLevel,
                staffRole: roleExists?.name,
                staffDept: deptExists.name,
                staffClass: staff.userClass,
                logoUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/PNG+WIZBIZ+LOGO%40200x-8.png',
                footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/wizhub-footer.png'
            });
        } catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }


        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
};


export const createStaff = async (req: Request, res: Response): Promise<any> => {
    const {
        fullName,
        organization,
        department,
        role,
        email,
        password,
        homeAddress,
        lga,
        state,
        phoneNumber,
        createdBy,
        createdByModel,
        userClass,
        staffLevel,
        description

    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = password.trim();
    // console.log({ posted: req.body });
    try {
        const organizationExists = await Organization.findById(organization);
        if (!organizationExists) {
            return res.status(400).json({ success: false, message: 'Organization does not exist' });

        }

        const staffExists = await Staff.findById(createdBy);
        if (!staffExists) {
            return res.status(400).json({ success: false, message: 'Un Authorized!' });

        }

        const deptExists = await Department.findById(department);
        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department does not exist' });

        }
        const roleExists = await Role.findById(role);
        if (!roleExists) {
            return res.status(400).json({ success: false, message: 'Role not found' });
        }

        if (!deptExists) {
            return res.status(400).json({ success: false, message: 'Department not found' });

        }
        const existingStaff = await Staff.findOne({ email: normalizedEmail, organization });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: 'User already exists in this organization' });

        }

        const hashedPassword = await bcrypt.hash(normalizedPass, 10);
        const firstName = fullName.split(' ')[0];

        const staff = await Staff.create({
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
            await sendStaffCreatedEmail({
                email: staff.email,
                firstName: staff.firstName,
                password: normalizedPass,
                nameOfOrg: organizationExists.name,
                staffLevel: staff.staffLevel,
                staffRole: roleExists?.name,
                staffDept: deptExists.name,
                staffClass: staff.userClass,
                logoUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/PNG+WIZBIZ+LOGO%40200x-8.png',
                footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/wizhub-footer.png'
            });
        } catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }


        res.status(201).json({ success: true, message: 'User registered successfully', payload: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
};

export const getStaffs = async (req: Request, res: Response) : Promise<any> => {
    // console.log('Registered models:', mongoose.modelNames());
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

        console.log({hereIsId:organisationId})

        const filter: any = {};

        // Basic filters
        if (organisationId) filter.organization = new mongoose.Types.ObjectId(organisationId as string);
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
            const results = await Staff.find(filter, 'id fullName').sort(sortOptions);
            return res.status(200).json({ success: true, payload: results });
           
        }

        // Main query
        const staffs = await Staff.find(filter)
            .populate('organization', 'name')
            .populate('branch', 'name')
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

export const getStaffProfileByStaffId = async (req: Request, res: Response):Promise<any> => {
  try {
    const { staffId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const staff = await Staff.findById(staffId)
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

    const staffData= {
        id:staff?._id,
        fullName:staff?.fullName,
         branch: staff.branch
        ? staff.branch
        : null,
    }

    return res.status(200).json({
    success:true,
      message: "Staff profile retrieved successfully",
      payload:staffData,
    });
  } catch (error: any) {
    console.error("Error fetching staff profile:", error);
    return res.status(500).json({
        success:false,
      message: "Server error while retrieving staff profile",
      error: error.message,
    });
  }
};