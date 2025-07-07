import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '../interfaces/role.interface';

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  permissions: [{ type: String }],
  createdBy: {
    createdByName: { type: String, required: true },
    createdById: { type: String, required: true },
  },
  isApproved: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  approvedBy: {
    approvedByName: { type: String },
    approvedById: { type: String},
    dateApproved: { type: Date},
  },
  description: { type: String, required: true },
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