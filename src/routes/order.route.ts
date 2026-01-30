import express from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

const router = express.Router();
const orderController = new OrderController();

// User Routes
router.post("/", authenticateUser, (req, res) => orderController.createOrder(req, res));
router.get("/my-orders", authenticateUser, (req, res) => orderController.getUserOrders(req, res));

// Admin Routes
router.get("/admin/all", authenticateUser, isAdmin, (req, res) => orderController.getAllOrders(req, res));
router.put("/admin/:id/status", authenticateUser, isAdmin, (req, res) => orderController.updateOrderStatus(req, res));

export default router;
