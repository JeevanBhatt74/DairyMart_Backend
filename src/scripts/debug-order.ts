import mongoose from 'mongoose';
import Order from '../models/order.model';
import { connectDatabase } from '../database/mongodb';
import dotenv from 'dotenv';
dotenv.config();

const debugOrder = async () => {
    try {
        await connectDatabase();
        console.log("Connected to DB");

        // Mock User ID - replace with a valid user ID from your logic or DB
        // I will use a fake one, which might fail if 'User' ref validation is strict and user doesn't exist.
        // So I should probably find a user first.

        // For now, let's try to find ONE user.
        // Create a dummy user if none exists, or just use a random ID (which might fail strict ref checks)
        // Better: Fetch a user if one exists.
        // For debug, let's assume validation isn't checking existence against DB for 'user' field unless populate/checking.
        // Mongoose 'ref' doesn't auto-validate existence on save.

        const userId = new mongoose.Types.ObjectId();

        const payload = {
            user: userId,
            items: [
                {
                    product: new mongoose.Types.ObjectId(),
                    quantity: 1
                }
            ],
            totalAmount: 100,
            shippingAddress: "Test Address",
            paymentMethod: "COD"
        };

        console.log("Attempting to create order with payload:", payload);

        const order = await Order.create(payload as any);
        console.log("Order created successfully:", order);

    } catch (error) {
        console.error("Order Creation Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugOrder();
