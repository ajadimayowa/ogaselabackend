import mongoose, { Document, Schema } from "mongoose";

export interface IPermission extends Document {
  name: string;
  label: string; // human-readable label
  description?: string;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Permission = mongoose.model<IPermission>(
  "Permission",
  PermissionSchema
);
