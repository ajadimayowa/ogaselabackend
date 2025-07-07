import mongoose, { Schema, model } from 'mongoose';
import { IDepartment } from '../interfaces/department.interface'; // Adjust path as needed

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: {
    createdByName: { type: String, required: true },
    createdById: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now }, // Default to current date
  },
  isApproved: { type: Boolean, default: false },
  approvedBy: {
    approvedByName: { type: String, required: true },
    approvedById: { type: String, required: true },
    dateApproved: { type: Date, default: Date.now }, // Default to current date
  },
  description: { type: String, required: true },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false, // removes __v
    transform: (_doc, ret) => {
      ret.id = ret._id;  // rename _id to id
      delete ret._id;    // remove _id
    }
  }
});

export const Department = model<IDepartment>('Department', departmentSchema);