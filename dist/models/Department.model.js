"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
const mongoose_1 = require("mongoose");
const departmentSchema = new mongoose_1.Schema({
    nameOfOrg: { type: String, required: true },
    nameOfDep: { type: String, required: true },
    orgEmail: { type: String, required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: {
        createdByName: { type: String, required: true },
        createdById: { type: String, required: true },
        dateCreated: { type: Date, default: Date.now }, // Default to current date
    },
    isApproved: { type: Boolean, default: false },
    approvedBy: {
        approvedByName: { type: String, required: true },
        approvedById: { type: String, required: true },
        dateApproved: { type: Date, default: Date.now }, // Default to current date
    },
    description: { type: String, required: true },
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
exports.Department = (0, mongoose_1.model)('Department', departmentSchema);
