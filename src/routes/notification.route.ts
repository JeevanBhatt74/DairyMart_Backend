import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router: Router = Router();

router.get("/", authenticateUser, getNotifications);
router.put("/:id/read", authenticateUser, markAsRead);
router.put("/read-all", authenticateUser, markAllAsRead);

export default router;
