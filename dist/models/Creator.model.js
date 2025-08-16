"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Creator = void 0;
const mongoose_1 = require("mongoose");
const CreatorSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: mongoose_1.Schema.Types.Mixed, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    isRootAdmin: { type: Boolean, default: false },
    updatedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    }
});
exports.Creator = (0, mongoose_1.model)('Creator', CreatorSchema);
