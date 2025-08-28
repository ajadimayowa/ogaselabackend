// models/Loan.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILoan extends Document {
  member: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  amount: number;
  interestRate: number;
  repaymentLength: number; // weeks or months
  disbursementDate: Date;
  dueDate: Date;
  status: "pending" | "approved" | "active" | "completed" | "defaulted";
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema: Schema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    repaymentLength: { type: Number, required: true },
    disbursementDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "active", "completed", "defaulted"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>("Loan", LoanSchema);
