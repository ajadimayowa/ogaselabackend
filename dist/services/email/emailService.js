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
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = (userEmail, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.BREVO_SMTP_HOST, // Brevo SMTP host
        port: parseInt('587'), // Use 587 for TLS
        auth: {
            user: process.env.BREVO_USERNAME, // Your Brevo SMTP username (API key)
            pass: process.env.BREVO_PASSWORD // Your Brevo API key (same as username)
        },
        secure: false, // Use TLS
    });
    const mailerOptions = {
        from: '"BCKash" <hello@floatsolutionhub.com>', // Sender address
        to: userEmail, // Recipient's email address
        subject: subject,
        html: html,
    };
    return transporter.sendMail(mailerOptions);
});
exports.sendMail = sendMail;
