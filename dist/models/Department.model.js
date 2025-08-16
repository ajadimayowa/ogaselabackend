"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
const mongoose_1 = require("mongoose");
const DepartmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
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
// Unique index for "name" within the same "organization"
DepartmentSchema.index({ organization: 1, name: 1 }, { unique: true });
exports.Department = (0, mongoose_1.model)('Department', DepartmentSchema);
