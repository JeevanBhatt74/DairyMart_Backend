import { Request, Response } from "express";
import { OrderRepository } from "../repositories/order.repository";
import { User } from "../models/user.model";

interface AuthRequest extends Request {
    user?: any;
}

export class OrderController {
    private orderRepository: OrderRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
    }

    async createOrder(req: AuthRequest, res: Response) {
        try {
            // Debugging: Check if user is attached
            if (!req.user || !req.user.id) {
                console.error("Order Create: User not authenticated or ID missing in token", req.user);
                return res.status(401).json({ success: false, message: "User not authenticated correctly" });
            }

            const { items, totalAmount, shippingAddress, paymentMethod, useDiscount } = req.body;
            const userId = req.user.id;

            // Debugging: Log payload
            console.log("Order Create Payload:", { userId, items, totalAmount, shippingAddress, paymentMethod, useDiscount });

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: "Order items are required" });
            }

            // --- Loyalty Discount Logic ---
            let finalAmount = totalAmount;
            let discountApplied = false;

            if (useDiscount && totalAmount >= 1000) {
                const user = await User.findById(userId);
                if (user && user.discountAvailable && user.loyaltyPoints >= 100) {
                    finalAmount = Math.round(totalAmount * 0.8); // 20% off
                    discountApplied = true;
                    // Deduct 100 points
                    user.loyaltyPoints -= 100;
                    user.discountAvailable = user.loyaltyPoints >= 100; // Check if still has enough
                    await user.save();
                    console.log(`💰 Discount applied for user ${userId}: Rs ${totalAmount} → Rs ${finalAmount} (20% off)`);
                }
            }

            const order = await this.orderRepository.createOrder({
                user: userId,
                items,
                totalAmount: finalAmount,
                shippingAddress,
                paymentMethod
            });

            // --- Loyalty Points Award ---
            if (finalAmount >= 1000) {
                const user = await User.findById(userId);
                if (user) {
                    user.loyaltyPoints += 20;
                    user.qualifyingOrderCount += 1;

                    // Bonus: every 5th qualifying order gives 100 extra points
                    if (user.qualifyingOrderCount % 5 === 0) {
                        user.loyaltyPoints += 100;
                        console.log(`🎉 Bonus 100 points for user ${userId} (${user.qualifyingOrderCount} qualifying orders)`);
                    }

                    // Check if discount is now available
                    if (user.loyaltyPoints >= 100) {
                        user.discountAvailable = true;
                    }

                    await user.save();
                    console.log(`⭐ +20 points for user ${userId}. Total: ${user.loyaltyPoints} pts, Orders: ${user.qualifyingOrderCount}`);
                }
            }

            res.status(201).json({
                success: true,
                message: discountApplied
                    ? `Order placed with 20% loyalty discount! You saved Rs ${totalAmount - finalAmount}`
                    : "Order placed successfully",
                data: order,
                discountApplied,
                originalAmount: discountApplied ? totalAmount : undefined,
            });
        } catch (error: any) {
            console.error("Order Create Error:", error);
            res.status(500).json({
                success: false,
                message: error.message,
                error: error.message,
                stack: error.stack
            });
        }
    }

    async getUserOrders(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const orders = await this.orderRepository.getOrdersByUser(userId);
            res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllOrders(req: Request, res: Response) {
        try {
            const orders = await this.orderRepository.getAllOrders();
            res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const order = await this.orderRepository.updateOrderStatus(req.params.id, status);
            if (!order) return res.status(404).json({ success: false, message: "Order not found" });
            res.status(200).json({ success: true, data: order });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
