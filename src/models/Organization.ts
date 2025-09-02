// models/Organization.ts
import { Schema, Document, model } from 'mongoose';

export interface IOrganization extends Document {
  id: string;
  name: string;
  email: string;
  address: string;
  lga: string;
  state: string;
  phoneNumber: number | string;
  createdBy: Schema.Types.ObjectId; // Only store creator's ID
  businessRule?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedBy?: Schema.Types.ObjectId;
  updatedByModel?: 'Creator' | 'Staffs';
  updatedAt?: Date;
  isDisabled?: boolean;
  isDeleted?: boolean;
  subscriptionPlan?: 'basic' | 'standard' | 'pro';
  regNumber: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    address: { type: String, required: true },
    lga: { type: String, required: true },
    state: { type: String, required: true },
    phoneNumber: { type: Schema.Types.Mixed, required: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
    businessRule: { type: Schema.Types.ObjectId, ref: 'BusinessRule'},
    
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Creator' },
    updatedByModel: {
      type: String,
      enum: ['Creator', 'Staffs'],
    },

    isDisabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    subscriptionPlan: {
      type: String,
      enum: ['basic', 'standard', 'pro'],
      default: 'pro',
    },

    regNumber: { type: String, required: true, unique: true },
    logo: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },
    description: { type: String },
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

OrganizationSchema.index({ name: 1, email: 1 }, { unique: true });

export const Organization = model<IOrganization>('Organization', OrganizationSchema);