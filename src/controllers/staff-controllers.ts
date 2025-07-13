import { Request, Response } from "express";
import User, { IStaff } from "../models/Staff";
import bcrypt from 'bcryptjs';
import { sendSuperAdminWelcomeEmail } from "../services/email/emailTypesHandler";
import moment from "moment";
import { ISuperAdminCreationEmail } from "../interfaces/email";
import Staff from "../models/Staff";
import Organization from "../models/Organization";




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