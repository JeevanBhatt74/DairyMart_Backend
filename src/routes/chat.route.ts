import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

const router = Router();
const chatController = new ChatController();

// User and Admin can fetch messages
router.get("/messages/:userId", authenticateUser, (req, res) => chatController.getMessages(req, res));

// Admin can fetch all conversations
router.get("/conversations", authenticateUser, isAdmin, (req, res) => chatController.getConversations(req, res));

// Mark as read
router.put("/read/:userId", authenticateUser, (req, res) => chatController.markAsRead(req, res));

export default router;
