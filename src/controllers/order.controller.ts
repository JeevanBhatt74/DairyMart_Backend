import { Request, Response } from "express";
import { OrderRepository } from "../repositories/order.repository";

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
            const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
            const userId = req.user.id; // From auth middleware

            const order = await this.orderRepository.createOrder({
                user: userId,
                items,
                totalAmount,
                shippingAddress,
                paymentMethod
            });

            res.status(201).json({ success: true, message: "Order placed successfully", data: order });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
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
