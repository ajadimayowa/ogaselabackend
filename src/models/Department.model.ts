import mongoose, { Schema, model } from 'mongoose';
import { IDepartment } from '../interfaces/department.interface'; // Adjust path as needed

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true},
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'createdByModel', // dynamic reference
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ['Creator', 'Staffs'], // only Creator or Staff can create
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      refPath: 'updatedByModel',
    },
    updatedByModel: {
      type: String,
      enum: ['Creator', 'Staffs'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Unique index for "name" within the same "organization"
DepartmentSchema.index({ organization: 1, name: 1 }, { unique: true });

export const Department = model<IDepartment>('Department', DepartmentSchema);