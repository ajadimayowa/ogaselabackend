import mongoose, { Document, Schema } from "mongoose";

export interface IManagerHistory {
  manager: mongoose.Types.ObjectId;
  from: Date;
  to?: Date;
}

export interface IBranchBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy:mongoose.Types.ObjectId;
  updatedAt:Date;
  createdAt:Date;
  isActive: boolean;
}

export interface IBranch extends Document {
  name: string;
  manager: mongoose.Types.ObjectId;
  managerHistory: IManagerHistory[];
  address: string;
  state: string;
  lga: string;
  organization: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isApproved?: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  isDisabled: boolean;
  disabledBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  staffs: mongoose.Types.ObjectId[];

  // Bank details
  bankDetails: IBranchBankDetails;

  // Current branch balance
  currentBalance: number;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: "Staffs", required: true },
    managerHistory: [
      {
        manager: { type: Schema.Types.ObjectId, ref: "Staffs" },
        from: { type: Date, default: Date.now },
        to: { type: Date },
      },
    ],
    address: { type: String, required: true },
    state: { type: String, required: true },
    lga: { type: String, required: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Staffs", required: true },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    isDisabled: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    isDeleted: { type: Boolean, default: false },
    staffs: [{ type: Schema.Types.ObjectId, ref: "Staffs" }],

    bankDetails: {
      type: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
        createdAt: { type: Date, default: Date.now },
        updatedAt:{ type: Date, default: Date.now },
        isActive: { type: Boolean, default: false },
      },
      default: null,
    },

    currentBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Transform output
branchSchema.set("toJSON", {
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString(); // expose as id
    delete ret._id;              // remove _id
    delete ret.__v;              // remove version key
    return ret;
  },
});

// Unique Constraints
branchSchema.index({ name: 1, organization: 1 }, { unique: true });
branchSchema.index({ manager: 1 }, { unique: true, sparse: true });

export const Branch = mongoose.model<IBranch>("Branch", branchSchema);