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
const mongoose_1 = __importStar(require("mongoose"));
const LoanSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Branch", required: true },
    member: { type: mongoose_1.Schema.Types.ObjectId, ref: "Member", required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs", required: true },
    principal: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // snapshot
    tenureMonths: { type: Number, required: true },
    totalRepayable: { type: Number, required: true },
    balance: { type: Number, required: true },
    penalty: {
        lateFeeRate: { type: Number, required: true }, // snapshot penalty rate
        calculationMethod: {
            type: String,
            enum: ["flat", "percentage"],
            default: "percentage",
        },
        gracePeriodDays: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: [
            "pending_authorizer",
            "pending_superadmin",
            "approved",
            "disbursed",
            "rejected",
            "closed",
        ],
        default: "pending_authorizer",
    },
    approvals: {
        branchAuthorizer: {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            date: { type: Date },
            remarks: { type: String },
        },
        superAdmin: {
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            date: { type: Date },
            remarks: { type: String },
        },
    },
    disbursement: {
        status: {
            type: String,
            enum: ["initiated", "approved", "rejected"],
        },
        initiatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
        approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date },
        externalReference: { type: String },
        bankDetails: {
            bankName: { type: String },
            accountNumber: { type: String },
            accountName: { type: String },
        },
    },
    repayments: [
        {
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            receivedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            method: { type: String },
            reference: { type: String },
        },
    ],
}, { timestamps: true });
// Transform output
LoanSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id.toString(); // expose as id
        delete ret._id; // remove _id
        delete ret.__v; // remove version key
        return ret;
    },
});
exports.default = mongoose_1.default.model("Loan", LoanSchema);
