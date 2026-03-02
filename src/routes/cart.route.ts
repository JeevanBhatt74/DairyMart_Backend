import express from "express";
import { CartController } from "../controllers/cart.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();
const cartController = new CartController();

// All cart routes require authentication
router.get("/", authenticateUser, (req, res) => cartController.getCart(req, res));
router.post("/", authenticateUser, (req, res) => cartController.addToCart(req, res));
router.delete("/:productId", authenticateUser, (req, res) => cartController.removeFromCart(req, res));
router.delete("/", authenticateUser, (req, res) => cartController.clearCart(req, res));

export default router;
