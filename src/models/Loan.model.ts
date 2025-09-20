import mongoose, { Schema, Document } from "mongoose";

export interface IRepayment {
  amount: number;
  date: Date;
  receivedBy: mongoose.Types.ObjectId; // staff that posted repayment
  method: string; // e.g. cash, transfer, POS
  reference?: string; // external transaction reference
}

export interface ILoan extends Document {
  organization: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // marketer who raised loan

  principal: number;
  interestRate: number; // snapshot %
  tenureMonths: number;
  totalRepayable: number;
  balance: number;

  penalty: {
    lateFeeRate: number; // % or flat amount, snapshotted
    calculationMethod: "flat" | "percentage";
    gracePeriodDays: number;
  };

  status:
    | "pending_authorizer"
    | "pending_superadmin"
    | "approved"
    | "disbursed"
    | "rejected"
    | "closed";

  approvals: {
    branchAuthorizer?: {
      user: mongoose.Types.ObjectId;
      date: Date;
      remarks?: string;
    };
    superAdmin?: {
      user: mongoose.Types.ObjectId;
      date: Date;
      remarks?: string;
    };
  };

  disbursement?: {
    status: "initiated" | "approved" | "rejected";
    initiatedBy?: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    date?: Date;
    externalReference?: string;

    // immutable snapshot of customer account details
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };

  repayments: IRepayment[];

  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Staffs", required: true },

    principal: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // snapshot
    tenureMonths: { type: Number, required: true },
    totalRepayable: { type: Number, required: true },
    balance: { type: Number, required: true },

    penalty: {
      lateFeeRate: { type: Number, required: true }, // snapshot penalty rate
      calculationMethod: {
        type: String,
        enum: ["flat", "percentage"],
        default: "percentage",
      },
      gracePeriodDays: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: [
        "pending_authorizer",
        "pending_superadmin",
        "approved",
        "disbursed",
        "rejected",
        "closed",
      ],
      default: "pending_authorizer",
    },

    approvals: {
      branchAuthorizer: {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        date: { type: Date },
        remarks: { type: String },
      },
      superAdmin: {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        date: { type: Date },
        remarks: { type: String },
      },
    },

    disbursement: {
      status: {
        type: String,
        enum: ["initiated", "approved", "rejected"],
      },
      initiatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      date: { type: Date },
      externalReference: { type: String },
      bankDetails: {
        bankName: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
      },
    },

    repayments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
        method: { type: String },
        reference: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Transform output
LoanSchema.set("toJSON", {
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString(); // expose as id
    delete ret._id;              // remove _id
    delete ret.__v;              // remove version key
    return ret;
  },
});

export default mongoose.model<ILoan>("Loan", LoanSchema);
