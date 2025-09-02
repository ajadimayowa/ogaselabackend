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
exports.sendLoginOtp = void 0;
const axios_1 = __importDefault(require("axios"));
const sendLoanApplicationSms = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, firstName, from, amount, loanId }) {
    const baseUrl = process.env.SMS_SENDER_PROVIDER || '';
    const apiKey = process.env.SMS_SENDER_APIKEY || '';
    try {
        const res = yield axios_1.default.post(baseUrl, {
            "to": `234${to}`,
            "from": `${from !== null && from !== void 0 ? from : 'Floath Hub'}`,
            "sms": `Hello ${firstName}, Loan Application Raised, Amount :N${amount} Loan ID ${loanId}. Date : ${Date.now}`,
            "type": "plain",
            "api_key": apiKey,
            "channel": "generic",
            // "media": {
            //     "url": "https://media.example.com/file",
            //     "caption": "your media file"
            // }
        });
    }
    catch (error) {
        console.log({ seeError: error });
    }
});
const sendLoginOtp = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, firstName, from, code }) {
    const baseUrl = process.env.SMS_SENDER_PROVIDER || '';
    const apiKey = process.env.SMS_SENDER_APIKEY || '';
    try {
        const res = yield axios_1.default.post(baseUrl, {
            "to": `234${to}`,
            "from": `${from !== null && from !== void 0 ? from : 'Floath Hub'}`,
            "sms": `Hello ${firstName}, Your login Otp is ${code}. Expires in 10 min.`,
            "type": "plain",
            "api_key": apiKey,
            "channel": "generic",
            // "media": {
            //     "url": "https://media.example.com/file",
            //     "caption": "your media file"
            // }
        });
    }
    catch (error) {
        console.log({ seeError: error });
    }
});
exports.sendLoginOtp = sendLoginOtp;
