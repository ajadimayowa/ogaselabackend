import mongoose, { Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  department: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  permissions: string[];
  createdBy: {
    createdByName: string;
    createdById: string;
  };
  isApproved?: boolean;
  isDisabled?: boolean;
  approvedBy?: {
    approvedByName: string;
    approvedById: string;
  };
  description: string;
}