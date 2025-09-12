// models/Member.ts 
import mongoose, { Schema, Document } from "mongoose";

export interface IRepaymentHistory {
  amountPaid: number;
  paymentDate: Date;
  method: string; // e.g. cash, transfer, POS
  reference?: string;
}

export interface IKYC {
  modeOfIdentification: string;
  identificationNumber?: string;
  memberIdDocumentFile?: string;
  passportPhoto: string;
  isVerified: boolean;
  biometric?: string;
}

export interface INOK {
  title?: string;
  fullName: string;
  phoneNumber: string;
  relationshipWithNok: string;

  address: string;
  state: string;

  attestationDocument: string;
  idCard: string;
  passport: string;

  isVerified: boolean;
}

export interface IG1 {
  title?: string;
  fullName: string;
  phoneNumber: string;
  relationshipWithNok?: string;

  address: string;
  state: string;

  attestationDocument: string;
  idCard: string;
  passport: string;

  isVerified: boolean;
}

export interface IRef {
  title?: string;
  fullName: string;
  phoneNumber: string;
  relationshipWithNok?: string;

  address: string;
  state: string;

  attestationDocument: string;
  idCard: string;
  passport: string;

  isVerified: boolean;
}



export interface IMember extends Document {
  title?: string;
  fullName: string;
  alias?: string;
  gender?: string;
  language: string;
  maritalStatus?: string;
  durationOfStay:string;
  bvn: number;
  phoneNumber: string;
  email: string;
  description?: string;
  isDisable: boolean;
  isPhoneVerified?: boolean;
  isApproved?: boolean;
  disabledBy?: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  noOfKids?: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  kyc?: IKYC;
  createdAt: Date;
  updatedAt: Date;

  state:string;
  lga:string
}

const RepaymentHistorySchema: Schema = new Schema(
  {
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    method: { type: String, required: true },
    reference: { type: String },
  },
  { _id: false }
);



const KycSchema: Schema = new Schema(
  {
    passportPhoto:{ type: String },
    idCardPhoto: { type: String },
    attestationDocumentFile: { type: String },
    utilityBillPhoto: { type: String },

    selectedModeOfIdentification:{ type: String },
    idIdentificationNumber: { type: String },

    isVerified: { type: Boolean, default: false },
    biometric: { type: String },
  },
  { _id: false }
);

const NOKSchema: Schema = new Schema(
  {
    title: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    relationshipWithNok: { type: String },
    address: { type: String },
    state: { type: String },
    attestationDocument: { type: String },
    idCard: { type: String },
    passport: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);
const G1Schema: Schema = new Schema(
  {
    title: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    relationshipWithNok: { type: String },
    address: { type: String },
    state: { type: String },
    attestationDocument: { type: String },
    idCard: { type: String },
    passport: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

const RefSchema: Schema = new Schema(
  {
    title: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    state: { type: String },
    attestationDocument: { type: String },
    idCard: { type: String },
    passport: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

const MemberSchema: Schema = new Schema(
  {
    title: { type: String },
    fullName: { type: String, required: true, trim: true },
    alias: { type: String, trim: true },
    gender: { type: String },
    maritalStatus: { type: String },
    dob: { type: String },
    state: { type: String },
    lga: { type: String },
    language: { type: String },
    homeAddress: { type: String },
    nearestBusStop: { type: String },
    durationOfStay: { type: String },
    officeAddress: { type: String },
    occupation: { type: String },
    bvn: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    noOfKids: { type: Number },
    descripstion: { type: String, default: "" },
    isApproved: { type: Boolean, default: false },
    isDisable: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: "Staffs" },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "Staffs", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Staffs" },



    kyc: KycSchema,
    nok: NOKSchema,
    gurantor1: G1Schema,
    gurantor2: G1Schema,
    ref: RefSchema,
  },
  { timestamps: true }
);

// ✅ Ensure BVN is unique within the organization
MemberSchema.index({ organization: 1, bvn: 1 }, { unique: true });

export default mongoose.model<IMember>("Member", MemberSchema);