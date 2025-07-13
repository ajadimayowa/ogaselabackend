import mongoose, { Document } from 'mongoose';

export interface IRole extends Document {
  roleName: string;
  roleDepartment: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  rolePermissions: string[];
  roleCreatedBy: {
    roleCreatedByName: string;
    roleCreatedById: string;
  };
  isApproved?: boolean;
  isDisabled?: boolean;
  roleApprovedBy?: {
    roleApprovedByName: string;
    roleApprovedById: string;
  };
  roleDescription: string;
}