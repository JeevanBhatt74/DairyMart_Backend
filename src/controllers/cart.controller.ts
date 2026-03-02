import { Request, Response } from "express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";

export class CartController {
    // Get user's cart
    async getCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            let cart = await Cart.findOne({ user: userId } as any).populate("items.product");

            if (!cart) {
                // Create empty cart if doesn't exist
                cart = await Cart.create({ user: userId, items: [] });
            }

            return res.status(200).json({
                success: true,
                data: cart,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Add item to cart or update quantity
    async addToCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { productId, quantity } = req.body;

            if (!productId || !quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID and valid quantity are required",
                });
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            let cart = await Cart.findOne({ user: userId } as any);

            if (!cart) {
                // Create new cart
                cart = await Cart.create({
                    user: userId,
                    items: [{ product: productId, quantity }],
                });
            } else {
                // Check if product already in cart
                const existingItemIndex = cart.items.findIndex(
                    (item) => item.product.toString() === productId
                );

                if (existingItemIndex > -1) {
                    // Update quantity
                    cart.items[existingItemIndex].quantity = quantity;
                } else {
                    // Add new item
                    cart.items.push({ product: productId, quantity });
                }

                await cart.save();
            }

            // Populate and return
            cart = await Cart.findById(cart._id).populate("items.product");

            return res.status(200).json({
                success: true,
                message: "Item added to cart",
                data: cart,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Remove item from cart
    async removeFromCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { productId } = req.params;

            const cart = await Cart.findOne({ user: userId } as any);

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: "Cart not found",
                });
            }

            // Remove item
            cart.items = cart.items.filter(
                (item) => item.product.toString() !== productId
            );

            await cart.save();

            // Populate and return
            const updatedCart = await Cart.findById(cart._id).populate("items.product");

            return res.status(200).json({
                success: true,
                message: "Item removed from cart",
                data: updatedCart,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Clear cart
    async clearCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const cart = await Cart.findOne({ user: userId } as any);

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: "Cart not found",
                });
            }

            cart.items = [];
            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Cart cleared",
                data: cart,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
