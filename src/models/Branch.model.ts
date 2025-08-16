import mongoose, { Document, Schema } from "mongoose";

export interface IManagerHistory {
  manager: mongoose.Types.ObjectId;
  from: Date;
  to?: Date;
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
  isApproved?:boolean,
  approvedBy?: mongoose.Types.ObjectId;
  isDisabled: boolean;
  disabledBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  staffs: mongoose.Types.ObjectId[];
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
    isApproved:{type: Boolean, default: false},
    approvedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    isDisabled: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    isDeleted: { type: Boolean, default: false },
    staffs: [{ type: Schema.Types.ObjectId, ref: "Staffs" }],
  },
  { timestamps: true }
);

// Unique Constraints
branchSchema.index({ name: 1, organization: 1 }, { unique: true });
branchSchema.index({ manager: 1 }, { unique: true, sparse: true });

export const Branch = mongoose.model<IBranch>("Branch", branchSchema);