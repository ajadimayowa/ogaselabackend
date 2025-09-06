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
exports.creatorLoginController = exports.registerCreatorController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Creator_model_1 = require("../../models/Creator.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const creators_emailNotifs_1 = require("../../services/email/creators/creators-emailNotifs");
const registerCreatorController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, phoneNumber, password, ownnerPass } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    console.log({ body: req.body });
    if (ownnerPass !== process.env.CREATOR_PASS) {
        return res.status(400).json({ success: false, message: 'Unauthorized access', payload: {} });
    }
    if (!fullName || !email || !phoneNumber || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required', payload: {} });
    }
    const existingCreator = yield Creator_model_1.Creator.findOne({
        email: normalizedEmail
    });
    if (existingCreator) {
        return res.status(400).json({ success: false, message: 'This creator already exists', payload: {} });
    }
    try {
        const hashPassword = bcryptjs_1.default.hashSync(password, 10);
        let firstName = fullName.split(' ')[0];
        // Await the async create operation
        yield Creator_model_1.Creator.create({
            fullName,
            firstName,
            email: normalizedEmail,
            phoneNumber,
            isRootAdmin: true,
            password: hashPassword
        });
        yield (0, creators_emailNotifs_1.sendCreatorCreatedEmail)({
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
    }
    catch (error) {
        console.error('Error creating creator:', error); // Safe internal logging
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});
exports.registerCreatorController = registerCreatorController;
const creatorLoginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required', payload: {} });
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
        const creator = yield Creator_model_1.Creator.findOne({ email: normalizedEmail });
        const dummyHash = "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, (creator === null || creator === void 0 ? void 0 : creator.password) || dummyHash);
        if (!creator || !isPasswordMatch) {
            return res.status(404).json({ success: false, message: 'Invalid Credentials.', payload: {} });
        }
        const payload = {
            id: creator.id,
            email: creator.email,
            isRootAdmin: creator.isRootAdmin,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        const creatorData = {
            id: creator.id,
            fullName: creator.fullName,
            firstName: creator.firstName,
            email: creator.email,
            phoneNumber: creator.phoneNumber,
            isRootAdmin: creator.isRootAdmin,
        };
        yield (0, creators_emailNotifs_1.sendCreatorLoginNotificationEmail)({
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});
exports.creatorLoginController = creatorLoginController;
