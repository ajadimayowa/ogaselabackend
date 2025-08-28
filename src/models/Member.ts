// models/Member.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRepaymentHistory {
  amountPaid: number;
  paymentDate: Date;
  method: string; // e.g. cash, transfer, POS
  reference?: string;
}

export interface IMember extends Document {
  fullName: string;
  bvn: number;
  phoneNumber: string;
  email: string;
  description: string;
  isDisable: boolean;
  disabledBy: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  totalAmountBorrowed: number;
  loanDisbursementDate: Date;
  loanRepaymentLength: number;
  repaymentHistory: IRepaymentHistory[];
  kyc?: {
    verificationType: string;
    verificationIdNumber: number | string;
    verificationIdDocument: string;
    isVerified: boolean;
    biometric: string;
  };
  nok?: {
    fullName: string;
    phoneNumber: string;
    address: string;
    isVerified: boolean;
    verificationType: string;
    verificationIdNumber: number | string;
    verificationIdDocument: string;
  };
  nextRepaymentDate: Date;
  expectedCompletionDate: Date;
  totalAmountPaidBack: number;
  amountToSettle: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepaymentHistorySchema: Schema = new Schema(
  {
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    method: { type: String, required: true },
    reference: { type: String },
  },
  { _id: false }
);

const MemberSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    bvn: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: "User" },

    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    totalAmountBorrowed: { type: Number, default: 0 },
    loanDisbursementDate: { type: Date },
    loanRepaymentLength: { type: Number }, // length in months or weeks
    repaymentHistory: [RepaymentHistorySchema],

    kyc: {
      verificationType: { type: String },
      verificationIdNumber: { type: Schema.Types.Mixed }, // allows number or string
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
      verificationIdNumber: { type: Schema.Types.Mixed },
      verificationIdDocument: { type: String },
    },

    nextRepaymentDate: { type: Date },
    expectedCompletionDate: { type: Date },
    totalAmountPaidBack: { type: Number, default: 0 },
    amountToSettle: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Ensure BVN is unique within the organization
MemberSchema.index({ organization: 1, bvn: 1 }, { unique: true });

export default mongoose.model<IMember>("Member", MemberSchema);
