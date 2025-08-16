import mongoose, { Document,Schema,Types } from 'mongoose';
import { IStaff } from '../models/Staff';
import { ICreator } from '../models/Creator.model';

export interface IDepartment extends Document {
  id: string;
  name: string;
  organization: Schema.Types.ObjectId; // link to Organization
  createdBy: Types.ObjectId | IStaff | ICreator;
  createdByModel: 'Creator' | 'Staffs';
  createdAt: Date;
  updatedByModel?: 'Creator' | 'Staffs';
  updatedBy?:  Types.ObjectId | IStaff | ICreator; // if you want the same flexibility here
  updatedAt?: Date;
  description: string;
  isApproved: boolean;
  approvedBy?: Schema.Types.ObjectId; // Optional, can be null if not approved
  isDisabled: boolean;
}