import { model, Document, Schema } from "mongoose";

export interface ICreator extends Document {
    id: string;
    fullName: string;
    firstName: string;
    email: string;
    phoneNumber: string | number;
    password: string;
    createdAt: Date;
    updatedAt?: Date;
    isApproved?: boolean;
    isDisabled?: boolean;
    isRootAdmin?: boolean; // Optional, if you want to differentiate root admins
}

const CreatorSchema = new Schema<ICreator>(
    {
        fullName: { type: String, required: true, trim: true },
        firstName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phoneNumber: { type: Schema.Types.Mixed, required: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isApproved: { type: Boolean, default: false },
        isDisabled: { type: Boolean, default: false },
        isRootAdmin: { type: Boolean, default: false },
        updatedAt: { type: Date },
    },
    {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret:any) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

export const Creator = model<ICreator>('Creator', CreatorSchema);