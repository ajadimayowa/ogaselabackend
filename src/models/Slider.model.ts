import mongoose, { Document, Schema } from "mongoose";

export interface IHomeSlider extends Document {
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink?: string; // optional - instead of onButtonClick, store a link
    isActive: boolean;
    order: number;
    category:string
}

const homeSliderSchema = new Schema<IHomeSlider>(
    {
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        image: { type: String, required: true },
        buttonText: { type: String, required: true },
        buttonLink: { type: String }, // link to a page or category (e.g. "/shop")
        isActive: { type: Boolean, default: true },
        category: { type: String },
        order: { type: Number, default: 0 }, // for sorting on homepage
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

export default mongoose.model<IHomeSlider>("HomeSlider", homeSliderSchema);