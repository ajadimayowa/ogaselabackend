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
exports.sendUserRegistrationNotificationEmail = void 0;
const emailService_1 = require("../emailService");
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sendUserRegistrationNotificationEmail = (creatorData) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, email, emailVerificationCode, logoUrl, footerUrl } = creatorData;
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'ogasela', 'RegistrationEmailTemplate.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName, email, emailVerificationCode, orgPrimaryColor: '#ffffffff' });
    const subject = 'Account Creation';
    const remoteImages = [
        {
            url: logoUrl || 'https://ogasela-bucket.s3.eu-north-1.amazonaws.com/images/website-pictures/ogasela-icon.png',
            cid: 'logo',
        },
        {
            url: footerUrl || 'https://ogasela-bucket.s3.eu-north-1.amazonaws.com/images/website-pictures/ogasela-footer.png',
            cid: 'footer',
        },
    ];
    try {
        yield (0, emailService_1.sendMail)({
            userEmail: email,
            subject,
            html,
            remoteImages, // optional, can be omitted if empty
            retries: 3, // number of retry attempts
            retryDelayMs: 2000 // delay between retries in ms
        });
        console.log(`✅ Email sent successfully to ${email}`);
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
    }
});
exports.sendUserRegistrationNotificationEmail = sendUserRegistrationNotificationEmail;
const sendRegistrationNotificationEmail2 = (creatorData) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, email, logoUrl, footerUrl } = creatorData;
    const loginTime = new Date().toLocaleString(); // Get the current date and time
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'creator', 'CreatorLoginEmailTemplate.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName, email, orgPrimaryColor: '#ffffffff', loginTime });
    const subject = 'Root Admin Login.';
    const remoteImages = [
        {
            url: logoUrl || 'https://bckash.s3.eu-north-1.amazonaws.com/images/bc-kash-logo-full.png',
            cid: 'logo',
        },
        {
            url: footerUrl || 'https://bckash.s3.eu-north-1.amazonaws.com/images/bckash-footer.png',
            cid: 'footer',
        },
    ];
    try {
        yield (0, emailService_1.sendMail)({
            userEmail: email,
            subject,
            html,
            remoteImages, // optional, can be omitted if empty
            retries: 3, // number of retry attempts
            retryDelayMs: 2000 // delay between retries in ms
        });
        console.log(`✅ Email sent successfully to ${email}`);
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
    }
});
