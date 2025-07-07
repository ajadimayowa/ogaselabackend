import { Request, Response } from "express";
import User, { IStaff } from "../models/User";
import bcrypt from 'bcryptjs';
import { sendSuperAdminWelcomeEmail } from "../services/email/emailTypesHandler";
import moment from "moment";




export const registerSuperAdmin = async (req: Request, res: Response) => {
    const {
        creatorPass,
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
        createdByName,
        createdById,
        userClass,
        isSuperAdmin,
        description

    } = req.body;

    console.log({ posted: req.body });
    try {
        if (creatorPass != process.env.CREATOR_ID) {
            res.status(401).json({ success: false, message: 'Un Authord!' });
            return

        }
        const existingUser = await User.findOne({ email });

        if (existingUser) res.status(400).json({ success: false, message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const firstName = fullName.split(' ')[0];

        const user = new User({
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
         

        const props = {
            firstName,
            loginEmail: email,
            tempPass: password,
            userClass,
            currentTime: moment().format('DD/MM/YYYY HH:MM A')}
        
            try {
              await sendSuperAdminWelcomeEmail(props)
            } catch (error) {
              console.error('Error sending role creation email:', error);
              
            }

        await user.save();
       

        res.status(201).json({ success: true, message: 'User registered successfully', payload: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', payload: err });
    }
};


export const onboardStaffToOrganisation = async (req: Request, res: Response) => {

    const { fullName, email, password, isSuperAdmin } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            isSuperAdmin,
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }


}