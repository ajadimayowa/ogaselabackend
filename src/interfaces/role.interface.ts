import mongoose, { Document,Types } from 'mongoose';
import { IStaff } from '../models/Staff';
import { ICreator } from '../models/Creator.model';

export interface IRole extends Document {
  id: string;
  name: string;
  department: Types.ObjectId;
  organization: Types.ObjectId;

  // Dynamic reference using refPath
  createdBy: Types.ObjectId | IStaff | ICreator;
  createdByModel: 'Creator' | 'Staffs';
  updatedByModel?: 'Creator' | 'Staffs';

  updatedBy?:  Types.ObjectId | IStaff | ICreator; // if you want the same flexibility here

  createdAt: Date;
  updatedAt: Date;
  isApproved?: boolean;
  isDisabled?: boolean;
  description: string;
  permissions: string[];
}