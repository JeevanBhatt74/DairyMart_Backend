import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    items: {
        product: mongoose.Schema.Types.ObjectId;
        quantity: number;
    }[];
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
        totalAmount: { type: Number, required: true },
        shippingAddress: { type: String, required: true },
        paymentMethod: { type: String, required: true, default: "COD" },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
