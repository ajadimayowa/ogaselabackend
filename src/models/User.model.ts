import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    profile: {
        fullName: string;
        firstName: string;
        lastName: string;
        bio?: string;
        password: string;
        profilePicUrl?: string;
        isVerified: boolean;
    };
    contact: {
        email: string;
        phoneNumber: string;
        address: string
    };
    kyc: {
        idCardNumber?: string;
        idCardPhoto?: string;
        isKycCompleted: boolean;
        verifiedAt: Date
    };
    ads: mongoose.Types.ObjectId[];
    isSeller: boolean;
    isAdmin: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    isDisable: boolean;
    isBanned: boolean;
    loginOtp: string | undefined;
    loginOtpExpires?: Date;
    resetPasswordOtp: string | undefined;
    resetPasswordOtpExpires: Date;
    isActive: boolean;

    businessDetails?: {
        name: string
        address: string
        phoneNumber: string
        regNumber: string
        certificate: string
        isVerified: boolean
        storeName?: string;
        rating?: number;
        totalSales?: number;
    }
}

const userSchema = new Schema<IUser>(
    {
        profile: {
            fullName: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            password: { type: String, required: true },
            profilePicUrl: { type: String },
            isVerified: { type: Boolean, default: false },
            bio:{type: String }
        },
        contact: {
            email: { type: String, required: true, unique: true },
            phoneNumber: { type: String, required: true, unique: true },
            address: { type: String },
        },
        kyc: {
            idCardNumber: { type: String },
            idCardPhoto: { type: String },
            isKycCompleted: { type: Boolean, default: false },
        },
        ads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ad" }],
        isSeller: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        emailVerificationToken: { type: String },
        emailVerificationExpires: { type: Date },
        isDisable: { type: Boolean, default: false },
        isBanned: { type: Boolean, default: false },
        loginOtp: { type: String },
        resetPasswordOtp: { type: String },
        loginOtpExpires: { type: Date },
        resetPasswordOtpExpires: { type: Date },

        isActive: { type: Boolean, default: true },

        businessDetails: {
            name: { type: String },
            address: { type: String },
            phoneNumber: { type: String },
            regNumber: { type: String },
            certificate: { type: String },
            isVerified: { type: String },
            storeName: { type: String },
            rating: { type: Number, default: 0, min: 0, max: 5 },
            totalSales: { type: Number, default: 0 },
        }

    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (_doc, ret: any) {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            }
        }
    }
);

export default mongoose.model<IUser>("User", userSchema);