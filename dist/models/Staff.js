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
exports.UserClassEnum = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserClassEnum;
(function (UserClassEnum) {
    UserClassEnum["Initiator"] = "initiator";
    UserClassEnum["Authorizer"] = "authorizer";
    UserClassEnum["User"] = "user";
})(UserClassEnum || (exports.UserClassEnum = UserClassEnum = {}));
const staffSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization' },
    branch: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Branch', default: null },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    roles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' }],
    homeAddress: { type: String, required: true },
    lga: { type: String, required: true },
    state: { type: String, required: true },
    phoneNumber: { type: Number, required: true, unique: true, sparse: true },
    emailOtp: { type: String },
    loginOtp: { type: String },
    resetPasswordOtp: { type: String },
    emailIsVerified: { type: Boolean, default: false },
    emailOtpExpires: { type: Date },
    resetPasswordOtpExpires: { type: Date },
    currentLevel: { type: String },
    isApproved: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    loginOtpExpires: { type: Date },
    isPasswordUpdated: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
    branchTransferHistory: [
        {
            fromBranch: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Branch' },
            toBranch: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Branch', required: true },
            transferDate: { type: Date, default: Date.now },
            reason: { type: String },
            approvedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Staff' }
        }
    ],
    staffNok: {
        fullName: { type: String },
        homeAddress: { type: String },
        lga: { type: String },
        state: { type: String },
        nokPhoneNumber: { type: String },
        passportPhotograph: { type: String },
        verificationIdType: {
            type: String,
            enum: ['bvn', 'int_passport', 'driver_license']
        },
        verificationIdNumber: { type: String },
        verificationDocumentFile: { type: String }
    },
    staffKyc: {
        verificationIdType: {
            type: String,
            enum: ['bvn', 'int_passport', 'driver_license']
        },
        verificationIdNumber: { type: String },
        verificationDocumentFile: { type: String }
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refPath: 'createdByModel', // dynamic reference
    },
    createdByModel: {
        type: String,
        required: true,
        enum: ['Creator', 'Staffs'], // only Creator or Staff can create
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'updatedByModel',
    },
    updatedByModel: {
        type: String,
        enum: ['Creator', 'Staffs'],
    },
    disabledBy: {
        type: String,
        refPath: 'disabledByModel',
    },
    disabledByModel: {
        type: String,
        enum: ['Creator', 'Staffs'],
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'approvedByModel',
    },
    approvedByModel: {
        type: String,
        enum: ['Creator', 'Staffs'],
    },
    userClass: {
        type: String,
        required: true,
        enum: ['initiator', 'authorizer', 'user'],
    },
    staffLevel: {
        type: String,
        required: true,
        enum: ['super-admin', 'approver', 'marketer', 'branch-manager', 'regular'],
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false, // removes __v
    }
});
staffSchema.index({ email: 1, phoneNumber: 1, 'staffNok.nokPhoneNumber': 1, organization: 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model('Staffs', staffSchema);
