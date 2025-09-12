"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// models/Member.ts 
const mongoose_1 = __importStar(require("mongoose"));
const RepaymentHistorySchema = new mongoose_1.Schema({
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    method: { type: String, required: true },
    reference: { type: String },
}, { _id: false });
const KycSchema = new mongoose_1.Schema({
    passportPhoto: { type: String },
    idCardPhoto: { type: String },
    attestationDocumentFile: { type: String },
    utilityBillPhoto: { type: String },
    selectedModeOfIdentification: { type: String },
    idIdentificationNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    biometric: { type: String },
}, { _id: false });
const NOKSchema = new mongoose_1.Schema({
    title: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    relationshipWithNok: { type: String },
    address: { type: String },
    state: { type: String },
    attestationDocument: { type: String },
    idCard: { type: String },
    passport: { type: String },
    isVerified: { type: Boolean, default: false },
}, { _id: false });
const G1Schema = new mongoose_1.Schema({
    title: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    relationshipWithNok: { type: String },
    address: { type: String },
    state: { type: String },
    attestationDocument: { type: String },
    idCard: { type: String },
    passport: { type: String },
    isVerified: { type: Boolean, default: false },
}, { _id: false });
const RefSchema = new mongoose_1.Schema({
    title: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    state: { type: String },
    attestationDocument: { type: String },
    idCard: { type: String },
    passport: { type: String },
    isVerified: { type: Boolean, default: false },
}, { _id: false });
const MemberSchema = new mongoose_1.Schema({
    title: { type: String },
    fullName: { type: String, required: true, trim: true },
    alias: { type: String, trim: true },
    gender: { type: String },
    maritalStatus: { type: String },
    dob: { type: String },
    state: { type: String },
    lga: { type: String },
    language: { type: String },
    homeAddress: { type: String },
    nearestBusStop: { type: String },
    durationOfStay: { type: String },
    officeAddress: { type: String },
    occupation: { type: String },
    bvn: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    noOfKids: { type: Number },
    descripstion: { type: String, default: "" },
    isApproved: { type: Boolean, default: false },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Branch", required: true },
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: "Group", required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    kyc: KycSchema,
    nok: NOKSchema,
    gurantor1: G1Schema,
    gurantor2: G1Schema,
    ref: RefSchema,
}, { timestamps: true });
// ✅ Ensure BVN is unique within the organization
MemberSchema.index({ organization: 1, bvn: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Member", MemberSchema);
