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
const MemberSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    bvn: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Branch", required: true },
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: "Group", required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    totalAmountBorrowed: { type: Number, default: 0 },
    loanDisbursementDate: { type: Date },
    loanRepaymentLength: { type: Number }, // length in months or weeks
    repaymentHistory: [RepaymentHistorySchema],
    kyc: {
        verificationType: { type: String },
        verificationIdNumber: { type: mongoose_1.Schema.Types.Mixed }, // allows number or string
        verificationIdDocument: { type: String },
        isVerified: { type: Boolean, default: false },
        biometric: { type: String }, // could be base64 or file reference
    },
    nok: {
        fullName: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        isVerified: { type: Boolean, default: false },
        verificationType: { type: String },
        verificationIdNumber: { type: mongoose_1.Schema.Types.Mixed },
        verificationIdDocument: { type: String },
    },
    nextRepaymentDate: { type: Date },
    expectedCompletionDate: { type: Date },
    totalAmountPaidBack: { type: Number, default: 0 },
    amountToSettle: { type: Number, default: 0 },
}, { timestamps: true });
// ✅ Ensure BVN is unique within the organization
MemberSchema.index({ organization: 1, bvn: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Member", MemberSchema);
