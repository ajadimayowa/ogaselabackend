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
const GroupSchema = new mongoose_1.Schema({
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    isApproved: { type: Boolean, default: false },
    groupName: { type: String, required: true, trim: true },
    description: { type: String },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Branch", required: true },
    groupMembers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Member" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    kyc: {
        isVerified: { type: Boolean, default: false },
        refferenceDocument: { type: String },
        attestationDocument: { type: String },
        gurantorDocument: { type: String },
    },
}, { timestamps: true });
// Transform output
GroupSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id.toString(); // expose as id
        delete ret._id; // remove _id
        delete ret.__v; // remove version key
        return ret;
    },
});
// ✅ Prevent duplicate group names inside the same org+branch
GroupSchema.index({ organization: 1, branch: 1, groupName: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Group", GroupSchema);
