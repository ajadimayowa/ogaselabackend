import mongoose, { Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  organization: mongoose.Types.ObjectId;
  createdBy: {
    createdByName: string;
    createdById: string;
  };
  isApproved?: boolean;
  approvedBy?: {
    approvedByName: string;
    approvedById: string;
  };
  description: string;
}