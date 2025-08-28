import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';
import { ICreator } from './Creator.model';

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
interface TransferHistory {
  fromBranch?: mongoose.Types.ObjectId | any; // optional for first branch assignment
  toBranch: mongoose.Types.ObjectId;
  transferDate: Date;
  reason?: string;
  approvedBy?: mongoose.Types.ObjectId; // Optional: Staff/Admin 
  transferedBy?: mongoose.Types.ObjectId; // Optional: Staff/Admin ID
}

export interface IStaff extends Document {
  id?: string,
  fullName: string;
  firstName: string;
  email: string;
  password: string;
  organization: Types.ObjectId;
  branch:Types.ObjectId;
  department: Types.ObjectId;
  roles: Types.ObjectId[];
  homeAddress: string;
  lga: string;
  state: string;
  phoneNumber: number;
  emailOtp?: string;
  loginOtp?: string;
  resetPasswordOtp?: string,
  emailIsVerified: boolean;
  emailOtpExpires?: Date;
  resetPasswordOtpExpires: Date;
  currentLevel?: string;
  isApproved: boolean;
  isDisabled: boolean;
  loginOtpExpires?: Date;
  isPasswordUpdated: boolean;
  isSuperAdmin: boolean;
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
  branchTransferHistory: TransferHistory[];
  staffKyc?: {
    verificationIdType?: 'bvn' | 'int_passport' | 'driver_license';
    verificationIdNumber?: string;
    verificationDocumentFile?: string;
  };

  createdBy: Types.ObjectId | IStaff | ICreator;
  createdByModel: 'Creator' | 'Staffs';

  updatedBy?: Types.ObjectId | IStaff | ICreator;
  updatedByModel?: 'Creator' | 'Staffs';
  

  approvedBy?: Types.ObjectId | IStaff | ICreator;
  approvedByModel?: 'Creator' | 'Staffs';

  disabledBy?: Types.ObjectId | IStaff | ICreator;
  disabledByModel?: 'Creator' | 'Staffs';

  userClass: 'initiator' | 'authorizer' | 'user';

  staffLevel: 'super-admin' | 'approver' | 'marketer' | 'branch-manager'|'regular',

  createdAt?: Date;
  updatedAt?: Date;
  disabledAt?: Date;
}

const staffSchema: Schema = new Schema<IStaff | ICreator>({
  fullName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
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
  branchTransferHistory: [
    {
      fromBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
      toBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
      transferDate: { type: Date, default: Date.now },
      reason: { type: String },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
    }
  ],
  staffNok: {
    fullName: { type: String },
    homeAddress: { type: String },
    lga: { type: String },
    state: { type: String },
    nokPhoneNumber: { type: String },
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
  disabledBy: {
    type: String,
    refPath: 'disabledByModel',
  },
  disabledByModel: {
    type: String,
    enum: ['Creator', 'Staffs'],
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    refPath: 'approvedByModel',
  },
  approvedByModel: {
    type: String,
    enum: ['Creator', 'Staffs'],
  },
  userClass: {
    type: String,
    required: true,
    enum: ['initiator', 'authorizer', 'user'],
  },
  staffLevel: {
    type: String,
    required: true,
    enum: ['super-admin', 'approver', 'marketer', 'branch-manager','regular'],
  }
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
  })
staffSchema.index({email:1,phoneNumber:1,'staffNok.nokPhoneNumber': 1,organization:1 }, { unique: true, sparse: true });
export default mongoose.model<IStaff>('Staffs', staffSchema);