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
exports.sendUserVerifiedEmail = exports.sendLoginNotificationEmail = exports.sendResetPasswordOtpEmail = exports.sendLoginOtpEmail = exports.sendPasswordChangedEmail = exports.sendPasswordResetEmail = exports.sendProfileUpdateEmail = exports.sendWelcomeEmail = exports.sendSuperAdminWelcomeEmail = exports.sendRoleCreationEmail = exports.sendDeptCreationEmail = exports.sendOrgWelcomeEmail = void 0;
// welcomeEmail.ts
const emailService_1 = require("./emailService");
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sendOrgWelcomeEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ nameOfOrg, orgRegNumber, orgEmail, orgPhoneNumber, orgSubscriptionPlan, currentTime, createdByName }) {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'orgRegEmail.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({
        nameOfOrg,
        orgRegNumber,
        orgEmail,
        orgPhoneNumber,
        orgSubscriptionPlan,
        currentTime,
        createdByName,
    });
    const subject = 'Succesfull Registration.';
    try {
        yield (0, emailService_1.sendMail)(orgEmail, subject, html);
        console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.sendOrgWelcomeEmail = sendOrgWelcomeEmail;
const sendDeptCreationEmail = (nameOfOrg, orgEmail, nameOfDept, currentTime, createdByName) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'departmentCreationEmail.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ nameOfOrg, currentTime, nameOfDept, createdByName });
    const subject = 'New Department Created.';
    try {
        yield (0, emailService_1.sendMail)(orgEmail, subject, html);
        console.log('email sent successfully!');
    }
    catch (error) {
        console.error('Error email:', error);
    }
});
exports.sendDeptCreationEmail = sendDeptCreationEmail;
const sendRoleCreationEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ nameOfOrg, currentTime, nameOfRole, orgEmail }) {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'roleCreationEmail.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ nameOfOrg, currentTime, nameOfRole });
    const subject = 'New Role Created.';
    try {
        yield (0, emailService_1.sendMail)(orgEmail, subject, html);
        console.log('email sent successfully!');
    }
    catch (error) {
        console.error('Error from Brevo email:', error);
    }
});
exports.sendRoleCreationEmail = sendRoleCreationEmail;
const sendSuperAdminWelcomeEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ firstName, loginEmail, tempPass, userClass, currentTime, createdByName, nameOfOrg, staffLevel }) {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'superAdminRegEmail.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName, loginEmail, tempPass, userClass, createdByName, currentTime, nameOfOrg, staffLevel });
    const subject = 'Super Admin Registration.';
    try {
        yield (0, emailService_1.sendMail)(loginEmail, subject, html);
        console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.sendSuperAdminWelcomeEmail = sendSuperAdminWelcomeEmail;
const sendWelcomeEmail = (firstName, userEmail, verifyEMailOtpCode) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'registration.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName, verifyEMailOtpCode });
    const subject = 'Email Verification Code';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendProfileUpdateEmail = (fullName, userEmail, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(__dirname, 'emailTemps', 'verification.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ fullName, verificationCode });
    const subject = 'Profile updated!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.sendProfileUpdateEmail = sendProfileUpdateEmail;
const sendPasswordResetEmail = (fullName, userEmail, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(__dirname, 'emailTemps', 'passwordResetRequest.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ fullName, verificationCode });
    const subject = 'Request to change password!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        // console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordChangedEmail = (fullName, userEmail, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(__dirname, 'emailTemps', 'passwordResetSuccess.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ fullName, verificationCode });
    const subject = 'Password Changed!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const sendLoginOtpEmail = (firstName, userEmail, loginOtp) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'loginOtp.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName, loginOtp });
    const subject = 'Login Otp!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        // console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending login email:', error);
    }
});
exports.sendLoginOtpEmail = sendLoginOtpEmail;
const sendResetPasswordOtpEmail = (firstName, userEmail, passwordResetOtp) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'services', 'email', 'emailTemps', 'passwordResetOtpN.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName, passwordResetOtp });
    const subject = 'Password Reset Otp!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        // console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending login email:', error);
    }
});
exports.sendResetPasswordOtpEmail = sendResetPasswordOtpEmail;
const sendLoginNotificationEmail = (firstName, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(__dirname, 'emailTemps', 'login.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ firstName });
    const subject = 'Login notification!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        // console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending login email:', error);
    }
});
exports.sendLoginNotificationEmail = sendLoginNotificationEmail;
const sendUserVerifiedEmail = (fullName, userEmail, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(__dirname, 'emailTemps', 'verification.hbs');
    const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars_1.default.compile(templateSource);
    const html = template({ fullName, verificationCode });
    const subject = 'You have been verified!';
    try {
        yield (0, emailService_1.sendMail)(userEmail, subject, html);
        // console.log('Welcome email sent successfully!');
    }
    catch (error) {
        console.error('Error sending login email:', error);
    }
});
exports.sendUserVerifiedEmail = sendUserVerifiedEmail;
// Example usage
