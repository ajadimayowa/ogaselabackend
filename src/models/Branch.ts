import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  nameOfBranch: string;
  branchManager: {
    id:string;
    fullName:string;
  };
  branchAddress: string;
  state: string;
  lga: string;
  createdByName: string;
  createdById: string;
  selectedApprover: string;
  organization: string;
  isApproved?:boolean;
  isDisabled?:boolean;
  isDeleted?:boolean;
  approvedById:string,
approvedName:string,

}

const BranchSchema: Schema = new Schema(
  {
    nameOfBranch: { type: String, required: true },
    branchManager: {
        id:{type:String,required:true},
        fullName:{type:String,required:true}
    },
    branchAddress: { type: String, required: true },
    state: { type: String, required: true },
    lga: { type: String, required: true },
    createdByName: { type: String, required: true },
    createdById: { type: String, required: true },
    selectedApprover: { type: String, required: false },
    approvedById:{ type: String },
    approvedName:{ type: String},
    isApproved: { type: Boolean, default:false},
    isDisabled: { type: Boolean, default:false},
    isDeleted: { type: Boolean, default:false},
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  },
  { timestamps: true }
);
BranchSchema.index({ nameOfBranch: 1, organization: 1 }, { unique: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);