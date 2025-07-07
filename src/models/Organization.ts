import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  email: string;
  address?: string;
  phoneNumber?: string;
  subscriptionPlan?: 'free' | 'basic' | 'pro';
  orgRegNumber:string;
  organisationLogo?: string;
  organisationPrimaryColor?: string;
  organisationSecondaryColor?: string;
}

const organizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true},
  email: { type: String, required: true,unique: true},
  phoneNumber: { type: String, required: true },
  address: {type:String,required: true },
  orgRegNumber:{type:String,required: true },
  subscriptionPlan: {
    type: String,
    required:true,
    enum: ['free', 'basic', 'pro'],
    default: 'free'
  },
  organisationLogo: {type:String},
  organisationPrimaryColor: {type:String},
  organisationSecondaryColor: {type:String}
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
});

export default mongoose.model<IOrganization>('Organizations', organizationSchema);