import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  nameOfOrg: string;
  orgEmail: string;
  orgAddress: string;
  orgLga: string;
  orgState: string;
  orgPhoneNumber: number | string;
  createdByName:string;
  createdByEmail: string;
  createdAt:Date,
  updatedAt?: Date;
  updatedBy?: string;
  isDisabled?: boolean;
  isDeleted?: boolean;
  orgSubscriptionPlan?: 'basic' | 'standard' | 'pro';
  orgRegNumber:string;
  organisationLogo?: string;
  organisationPrimaryColor?: string;
  organisationSecondaryColor?: string;
}

const organizationSchema = new Schema<IOrganization>(
  {
    nameOfOrg: { type: String, required: true },
    orgEmail: { type: String, required: true, unique: true },
    orgPhoneNumber: { type: String, required: true }, // changed to string for flexibility
    orgAddress: { type: String, required: true },
    orgLga: { type: String, required: true },
    orgState: { type: String, required: true },
    orgRegNumber: { type: String, required: true },
    createdByName: { type: String, required: true },
    createdByEmail: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    isDisabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    orgSubscriptionPlan: {
      type: String,
      enum: ['basic', 'standard', 'pro'],
      default: 'basic',
    },
    organisationLogo: { type: String },
    organisationPrimaryColor: { type: String },
    organisationSecondaryColor: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export default mongoose.model<IOrganization>('Organization', organizationSchema);