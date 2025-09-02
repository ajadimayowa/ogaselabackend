"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
// models/Organization.ts
const mongoose_1 = require("mongoose");
const OrganizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    address: { type: String, required: true },
    lga: { type: String, required: true },
    state: { type: String, required: true },
    phoneNumber: { type: mongoose_1.Schema.Types.Mixed, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Creator', required: true },
    businessRule: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BusinessRule' },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Creator' },
    updatedByModel: {
        type: String,
        enum: ['Creator', 'Staffs'],
    },
    isDisabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    subscriptionPlan: {
        type: String,
        enum: ['basic', 'standard', 'pro'],
        default: 'pro',
    },
    regNumber: { type: String, required: true, unique: true },
    logo: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },
    description: { type: String },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        },
    },
});
OrganizationSchema.index({ name: 1, email: 1 }, { unique: true });
exports.Organization = (0, mongoose_1.model)('Organization', OrganizationSchema);
