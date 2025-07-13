import mongoose, { Document } from 'mongoose';

export interface IDepartment extends Document {
  nameOfOrg: string;
  orgEmail: string;
  nameOfDep: string;
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