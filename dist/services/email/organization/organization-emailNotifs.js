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
exports.sendOrgDeptCreationEmail = exports.sendOrganizationCreatedEmail = void 0;
const emailService_1 = require("../emailService");
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sendOrganizationCreatedEmail = (creatorData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, regNumber, address, state, lga, orgPrimaryColor, createdByName, email, phoneNumber, logoUrl, footerUrl } = creatorData;
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'organization', 'OrganizationCreationEmailTemplate.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ name, email, phoneNumber, regNumber, createdByName, state, lga, address, orgPrimaryColor: '#ffffffff' });
    const subject = 'Welcome onboard!';
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
exports.sendOrganizationCreatedEmail = sendOrganizationCreatedEmail;
const sendOrgDeptCreationEmail = (creatorData) => __awaiter(void 0, void 0, void 0, function* () {
    const { nameOfDept, nameOfOrg, orgEmail, createdByName, logoUrl, footerUrl } = creatorData;
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'DepartmentCreationEmailTemplate.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ nameOfDept, nameOfOrg, orgEmail, createdByName, orgPrimaryColor: '#ffffffff' });
    const subject = 'New Department Created!';
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
            userEmail: orgEmail,
            subject,
            html,
            remoteImages, // optional, can be omitted if empty
            retries: 3, // number of retry attempts
            retryDelayMs: 2000 // delay between retries in ms
        });
        console.log(`✅ Email sent successfully to ${orgEmail}`);
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${orgEmail}:`, error);
    }
});
exports.sendOrgDeptCreationEmail = sendOrgDeptCreationEmail;
