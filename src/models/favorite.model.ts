import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
    user: mongoose.Schema.Types.ObjectId;
    product: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FavoriteSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    },
    { timestamps: true }
);

// Ensure a user can only favorite a product once
FavoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IFavorite>("Favorite", FavoriteSchema);
