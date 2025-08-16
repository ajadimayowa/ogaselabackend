import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '../interfaces/role.interface';
import { GLOBAL_PERMISSIONS } from '../constants/permissions';

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    permissions: [{
    type: String,
    enum: GLOBAL_PERMISSIONS.map(p => p.name), // validates against your global list
  }],

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

    isApproved: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false, // removes __v
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString(); // rename _id to id
        delete ret._id; // remove _id
      },
    },
  }
);

roleSchema.index({name:1,department:1,organization:1},{ unique: true })
export default mongoose.model<IRole>('Role', roleSchema);