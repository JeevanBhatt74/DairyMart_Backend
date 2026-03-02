import { Router, Request, Response } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/user.model";

const router = Router();

// GET /api/loyalty/points - Get user's loyalty points & status
router.get("/points", authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("loyaltyPoints qualifyingOrderCount discountAvailable");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                loyaltyPoints: user.loyaltyPoints,
                qualifyingOrderCount: user.qualifyingOrderCount,
                discountAvailable: user.discountAvailable,
                pointsToNextDiscount: Math.max(0, 100 - user.loyaltyPoints),
                ordersToNextBonus: 5 - (user.qualifyingOrderCount % 5),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
