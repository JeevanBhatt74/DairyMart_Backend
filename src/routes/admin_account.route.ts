import express from "express";
import { getAdminBalance } from "../controllers/admin_account.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
};

router.get("/balance", authenticateUser, isAdmin, getAdminBalance);

export default router;
