import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IStaffKyc {
  verificationIdType?: 'bvn' | 'int_passport' | 'driver_license';
  verificationIdImage: string,
  verificationIdNumber: string;
  passportPhotograph?: string;
}

export interface IStaffNok {
  fullName: string;
  phoneNumber: string;
  homeAddress: string;
  officeAddress: string;
  staffKyc?: IStaffKyc;
  passportPhotograph?: string;
  verificationIdType?: 'bvn' | 'int_passport' | 'driver_license';
  verificationIdNumber: string;
  verificationIdImage: string,
}

export type UserClass = 'initiator' | 'authorizer' | 'user' | 'creator';
export enum UserClassEnum {
  Initiator = 'initiator',
  Authorizer = 'authorizer',
  User = 'user'
}
export interface IUserClass {
  userClass: UserClassEnum;
}
export interface ICreatedBy {
  createdByName: string;
  createdById: string;
  createdByClass: UserClass;
}

export interface IStaff extends Document {
  id?:string,
  fullName: string;
  firstName: string;
  email: string;
  password: string;
  organization: Types.ObjectId;
  department: Types.ObjectId;
  roles: Types.ObjectId[];
  homeAddress: string;
  lga: string;
  state: string;
  phoneNumber: number;
  emailOtp?: string;
  loginOtp?: string;
  resetPasswordOtp?:string,
  emailIsVerified: boolean;
  emailOtpExpires?: Date;
  resetPasswordOtpExpires:Date;
  currentLevel?: string;
  isApproved: boolean;
  isDisabled: boolean;
  loginOtpExpires?: Date;
  isPasswordUpdated: boolean;
  isSuperAdmin: boolean;
  isCreator: boolean;
  staffNok?: {
    fullName?: string;
    homeAddress?: string;
    lga?: number;
    state?: number;
    phoneNumber?: number;
    passportPhotograph?: string;
    verificationIdType?: 'bvn' | 'int_passport' | 'driver_license';
    verificationIdNumber?: string;
    verificationDocumentFile?: string;
  };
  staffKyc?: {
    verificationIdType?: 'bvn' | 'int_passport' | 'driver_license';
    verificationIdNumber?: string;
    verificationDocumentFile?: string;
  };
  createdBy: {
    createdByName: string;
    createdById: string;
    dateCreated?: Date;
  };
  approvedBy: {
    approvedByName: string;
    approvedById: string;
    dateApproved?: Date;
  };
  userClass: 'initiator' | 'authorizer' | 'user';
  staffLevel: 'super-admin'|'approver'|'marketer'|'branch-manager'|'creator'
  createdAt?: Date;
  updatedAt?: Date;
}

const staffSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  homeAddress: { type: String, required: true },
  lga: { type: String, required: true },
  state: { type: String, required: true },
  phoneNumber: { type: Number, required: true, unique: true, sparse: true },
  emailOtp: { type: String },
  loginOtp: { type: String },
  resetPasswordOtp: { type: String },
  emailIsVerified: { type: Boolean, default: false },
  emailOtpExpires: { type: Date },
  resetPasswordOtpExpires: { type: Date },
  currentLevel: { type: String },
  isApproved: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  loginOtpExpires: { type: Date },
  isPasswordUpdated: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  isCreator: { type: Boolean, default: false },
  staffNok: {
    fullName: { type: String },
    homeAddress: { type: String },
    lga: { type: Number },
    state: { type: Number },
    nokPhoneNumber: { type: Number},
    passportPhotograph: { type: String },
    verificationIdType: {
      type: String,
      enum: ['bvn', 'int_passport', 'driver_license']
    },
    verificationIdNumber: { type: String },
    verificationDocumentFile: { type: String }
  },
  staffKyc: {
    verificationIdType: {
      type: String,
      enum: ['bvn', 'int_passport', 'driver_license']
    },
    verificationIdNumber: { type: String },
    verificationDocumentFile: { type: String }
  },
  createdBy: {
    createdByName: { type: String, required: true },
    createdById: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now }, // Default to current date
  },
  approvedBy: {
    approvedByName: { type: String, required: true },
    approvedById: { type: String, required: true },
    dateApproved: { type: Date, default: Date.now }, // Default to current date
  },
  userClass: {
    type: String,
    required: true,
    enum: ['initiator', 'authorizer', 'user'],
  },
  staffLevel: {
    type: String,
    required: true,
    enum: ['super-admin', 'approver', 'marketer','branch-manager','creator'],
  }
},
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false, // removes __v
    }
  })
staffSchema.index({ 'staffNok.nokPhoneNumber': 1 }, { unique: true, sparse: true });
export default mongoose.model<IStaff>('Staffs', staffSchema);