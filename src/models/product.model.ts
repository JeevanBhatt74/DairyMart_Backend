import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
        image: { type: String, required: false }, // URL to the image
        calories: { type: Number, required: false }, // kcal per 100g
        protein: { type: Number, required: false }, // grams per 100g
        fat: { type: Number, required: false }, // grams per 100g
        carbohydrates: { type: Number, required: false }, // grams per 100g
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
