import Order, { IOrder } from "../models/order.model";
import mongoose from "mongoose";

export class OrderRepository {
    async createOrder(data: Partial<IOrder>): Promise<IOrder> {
        return await Order.create(data);
    }

    async getOrdersByUser(userId: string): Promise<IOrder[]> {
        return await Order.find({ user: new mongoose.Types.ObjectId(userId) as any }).populate("items.product").sort({ createdAt: -1 });
    }

    async getAllOrders(): Promise<IOrder[]> {
        return await Order.find().populate("user", "fullName email").populate("items.product").sort({ createdAt: -1 });
    }

    async updateOrderStatus(id: string, status: string): Promise<IOrder | null> {
        return await Order.findByIdAndUpdate(id, { status }, { new: true });
    }
}
