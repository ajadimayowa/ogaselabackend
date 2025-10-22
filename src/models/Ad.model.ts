import mongoose, { Document, Schema } from "mongoose";

export interface IAd extends Document {
    title: string;
    description: string;
    price: number;
    image?: string; // main display image
    images: string[];
    sellerName: string;
    reviewCount: number;
    category: mongoose.Types.ObjectId;
    subCategory?: mongoose.Types.ObjectId;
    condition: "new" | "used";
    location?: {
        state?: string;
        city?: string;
        address?: string;
    };
    seller: mongoose.Types.ObjectId;
    isActive: boolean;
    isSold: boolean;
    views: number;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
    promotionType: {
        plan: "free" | "basic" | "standard" | "premium";
        price: number;
        durationInDays?: number;
        startDate?: Date;
        endDate?: Date;
        paymentCompleted: boolean;
        paymentReference?: string;
    };
}

const adSchema = new Schema<IAd>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, minlength: 10 },
        price: { type: Number, required: true, min: 0 },
        image: { type: String, required: false }, // main product thumbnail
        images: {
            type: [String],
            validate: [(arr: string[]) => arr.length <= 5, "Max 5 images allowed"],
        },
        sellerName: { type: String, required: true }, // for display
        reviewCount: { type: Number, default: 0 },
        category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        subCategory: { type: Schema.Types.ObjectId, ref: "Category" },
        condition: { type: String, enum: ["new", "used"], required: true },
        location: {
            state: { type: String },
            city: { type: String },
            address: { type: String },
        },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true },
        isSold: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        promotionType: {
            plan: {
                type: String,
                enum: ["free", "basic", "standard", "premium"],
                default: "basic",
            },
            price: { type: Number, required: true, default: 0 },
            durationInDays: { type: Number, default: 7 },
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
            paymentCompleted: { type: Boolean, default: false },
            paymentReference: { type: String },
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
            },
        },
    }
);

// 🔹 Promotion Pricing Logic
const PROMOTION_PRICING: Record<string, { price: number; durationInDays: number }> = {
    free: { price: 0, durationInDays: 7 },
    basic: { price: 500, durationInDays: 14 },
    standard: { price: 1000, durationInDays: 30 },
    premium: { price: 2000, durationInDays: 60 },
};

// 🔸 Pre-save hook to auto-assign promo details
adSchema.pre("save", function (next) {
    const ad = this as IAd;
    const promo = PROMOTION_PRICING[ad.promotionType.plan];

    if (promo) {
        ad.promotionType.price = promo.price;
        ad.promotionType.durationInDays = promo.durationInDays;
        ad.promotionType.startDate = ad.promotionType.startDate || new Date();
        ad.promotionType.endDate = new Date(
            ad.promotionType.startDate.getTime() + promo.durationInDays * 24 * 60 * 60 * 1000
        );

        // Only mark free plan as completed immediately
        if (ad.promotionType.plan === "free") {
            ad.promotionType.paymentCompleted = true;
        }
    }

    next();
});

// 🧠 Auto-update seller status once they post their first ad
adSchema.post("save", async function (doc) {
    const User = mongoose.model("User");
    const seller = await User.findById(doc.seller);

    if (seller && !seller.isSeller) {
        seller.isSeller = true;
        await seller.save();
    }
});

export default mongoose.model<IAd>("Ad", adSchema);