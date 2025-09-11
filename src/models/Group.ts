import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  id: string; // comes from toJSON transform
  isApproved: boolean;
  groupName: string;
  description?: string;
  isDisable: boolean;
  disabledBy?: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  groupMembers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  kyc: {
    isVerified: boolean;
    refferenceDocument: string;
    attestationDocument: string;
    gurantorDocument: string;
  };
}

const GroupSchema: Schema = new Schema(
  {
    approvedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    isApproved: { type: Boolean, default: false },
    groupName: { type: String, required: true, trim: true },
    description: { type: String },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: "Staffs" },

    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    groupMembers: [{ type: Schema.Types.ObjectId, ref: "Member" }],

    createdBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },

    kyc: {
      isVerified: { type: Boolean, default: false },
      refferenceDocument: { type: String },
      attestationDocument: { type: String },
      gurantorDocument: { type: String },
    },
  },
  { timestamps: true }
);

// Transform output
GroupSchema.set("toJSON", {
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString(); // expose as id
    delete ret._id;              // remove _id
    delete ret.__v;              // remove version key
    return ret;
  },
});

// ✅ Prevent duplicate group names inside the same org+branch
GroupSchema.index({ organization: 1, branch: 1, groupName: 1 }, { unique: true });

export default mongoose.model<IGroup>("Group", GroupSchema);
