import mongoose, { Document, Schema } from "mongoose";

export interface IDisbursementAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface IBranchFundTransaction extends Document {
  branch: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  amount: number;
  type: "CREDIT" | "DEBIT"; // CREDIT = funding, DEBIT = loan disbursement/adjustment
  purpose: string; // e.g. "Admin Funding", "Loan Disbursement"
  reference: string; // manual or bank transaction reference
  accountSnapshot: IDisbursementAccount; // snapshot of account details at time of transaction
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const branchFundTransactionSchema = new Schema<IBranchFundTransaction>(
  {
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    purpose: { type: String, required: true },
    reference: { type: String, required: true },

    accountSnapshot: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true },
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "Staffs", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Transform output
branchFundTransactionSchema.set("toJSON", {
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString(); // expose as id
    delete ret._id;              // remove _id
    delete ret.__v;              // remove version key
    return ret;
  },
});

export const BranchFundTransaction = mongoose.model<IBranchFundTransaction>(
  "BranchFundTransaction",
  branchFundTransactionSchema
);