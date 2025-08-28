// models/Group.ts
import mongoose, { Schema, Document } from "mongoose";

interface IGroupMembers {
  fullName: string,
    bvn:number,
    phoneNumber:number|string,
    loanAmount:number,
    email: string,
}
export interface IGroup extends Document {
  groupName: string;
  description?: string;
  isDisable: boolean;
  disabledBy?: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  groupMembers: IGroupMembers[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  totalAmountBorrowed: number;   // cumulative borrowed by all members
  totalAmountRefunded: number;   // cumulative refunded by all members
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    groupName: { type: String, required: true, trim: true },
    description: { type: String },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: "User" },

    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    groupMembers: [
  {
    fullName: { type: String, required: true },
    bvn: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    email: { type: String, required: true },
  }
],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    totalAmountBorrowed: { type: Number, default: 0 },
    totalAmountRefunded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate group names inside the same org+branch
GroupSchema.index({ organization: 1, branch: 1, groupName: 1 }, { unique: true });

export default mongoose.model<IGroup>("Group", GroupSchema);
