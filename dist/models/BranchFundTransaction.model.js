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
exports.BranchFundTransaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const branchFundTransactionSchema = new mongoose_1.Schema({
    branch: { type: mongoose_1.Schema.Types.ObjectId, ref: "Branch", required: true },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    purpose: { type: String, required: true },
    reference: { type: String, required: true },
    accountSnapshot: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true },
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs", required: true },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staffs" },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
// Transform output
branchFundTransactionSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id.toString(); // expose as id
        delete ret._id; // remove _id
        delete ret.__v; // remove version key
        return ret;
    },
});
exports.BranchFundTransaction = mongoose_1.default.model("BranchFundTransaction", branchFundTransactionSchema);
