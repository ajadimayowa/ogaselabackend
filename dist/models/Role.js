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
const roleSchema = new mongoose_1.Schema({
    roleName: { type: String, required: true },
    roleDepartment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    rolePermissions: [{ type: String }],
    roleCreatedBy: {
        roleCreatedById: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
        roleCreatedByName: { type: String, required: true }
    },
    isApproved: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    roleApprovedBy: {
        roleApprovedByName: { type: String },
        roleApprovedById: { type: String },
        dateApproved: { type: Date },
    },
    roleDescription: { type: String, required: true },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false, // removes __v
        transform: (_doc, ret) => {
            ret.id = ret._id; // rename _id to id
            delete ret._id; // remove _id
        }
    }
});
exports.default = mongoose_1.default.model('Role', roleSchema);
