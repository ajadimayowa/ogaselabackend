import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Creator } from '../../models/Creator.model';
import jwt from 'jsonwebtoken';
import { sendCreatorCreatedEmail, sendCreatorLoginNotificationEmail } from '../../services/email/creators/creators-emailNotifs';


const registerCreatorController = async (req: Request, res: Response): Promise<any> => {
    const { fullName, email, phoneNumber, password, ownnerPass } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    console.log({ body: req.body });
    if (ownnerPass !== process.env.CREATOR_PASS) {
        return res.status(400).json({ success: false, message: 'Unauthorized access', payload: {} });
    }
    if (!fullName || !email || !phoneNumber || !password) {

        return res.status(400).json({ success: false, message: 'All fields are required', payload: {} });
    }

    const existingCreator = await Creator.findOne({
        email: normalizedEmail
    })

    if (existingCreator) {
        return res.status(400).json({ success: false, message: 'This creator already exists', payload: {} });
    }
    try {
        const hashPassword = bcrypt.hashSync(password, 10);
        let firstName = fullName.split(' ')[0];

        // Await the async create operation
        await Creator.create({
            fullName,
            firstName,
            email: normalizedEmail,
            phoneNumber,
            isRootAdmin: true,
            password: hashPassword
        });


        await sendCreatorCreatedEmail({
            firstName,
            email,
            password,
            logoUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/PNG+WIZBIZ+LOGO%40200x-8.png',
            footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/wizhub-footer.png'
        }).catch((error) => {
            console.error('Error sending email:', error);
        });

        res.status(200).json({
            success: true,
            message: 'Creator created successfully',
            payload: { fullName, email, phoneNumber }
        });

    } catch (error) {
        console.error('Error creating creator:', error); // Safe internal logging
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
}

const creatorLoginController = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required', payload: {} });
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
        const creator = await Creator.findOne({ email: normalizedEmail });
        const dummyHash = "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
        const isPasswordMatch = await bcrypt.compare(password, creator?.password || dummyHash);

        if (!creator || !isPasswordMatch) {
            return res.status(404).json({ success: false, message: 'Invalid Credentials.', payload: {} });
        }

        const payload = {
            id: creator.id,
            email: creator.email,
            isRootAdmin: creator.isRootAdmin,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
        const creatorData = {
            id: creator.id,
            fullName: creator.fullName,
            firstName: creator.firstName,
            email: creator.email,
            phoneNumber: creator.phoneNumber,
            isRootAdmin: creator.isRootAdmin,
        };
        await sendCreatorLoginNotificationEmail({
            firstName: creator.firstName,
            email,
            logoUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/PNG+WIZBIZ+LOGO%40200x-8.png',
            footerUrl: 'https://bckash.s3.eu-north-1.amazonaws.com/images/wizhub-footer.png'
        }).catch((error) => {
            console.error('Error sending email:', error);
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            payload: {
                token: token,
                creatorData
            }
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }

}

export { registerCreatorController, creatorLoginController };

