import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '../interfaces/role.interface';

const roleSchema = new Schema<IRole>({
  roleName: { type: String, required: true },
  roleDepartment: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  rolePermissions: [{ type: String }],
  roleCreatedBy: {
    roleCreatedById: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    roleCreatedByName: { type: String, required: true }
  },
  isApproved: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  roleApprovedBy: {
    roleApprovedByName: { type: String },
    roleApprovedById: { type: String },
    dateApproved: { type: Date },
  },
  roleDescription: { type: String, required: true },
},
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false, // removes __v
      transform: (_doc, ret) => {
        ret.id = ret._id;  // rename _id to id
        delete ret._id;    // remove _id
      }
    }
  }
);

export default mongoose.model<IRole>('Role', roleSchema);