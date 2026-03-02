import { Request, Response } from "express";
import Favorite from "../models/favorite.model";

export class FavoriteController {
    // Toggle favorite (add or remove)
    async toggleFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required",
                });
            }

            // Check if already favorited
            const existing = await Favorite.findOne({ user: userId, product: productId } as any);

            if (existing) {
                // Remove from favorites
                await Favorite.deleteOne({ _id: existing._id });
                return res.status(200).json({
                    success: true,
                    message: "Removed from favorites",
                    isFavorited: false,
                });
            } else {
                // Add to favorites
                await Favorite.create({ user: userId, product: productId });
                return res.status(200).json({
                    success: true,
                    message: "Added to favorites",
                    isFavorited: true,
                });
            }
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Get all user favorites
    async getUserFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const favorites = await Favorite.find({ user: userId } as any).populate("product");

            return res.status(200).json({
                success: true,
                data: favorites,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // Check if product is favorited
    async checkFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { productId } = req.params;

            const favorite = await Favorite.findOne({ user: userId, product: productId } as any);

            return res.status(200).json({
                success: true,
                isFavorited: !!favorite,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
