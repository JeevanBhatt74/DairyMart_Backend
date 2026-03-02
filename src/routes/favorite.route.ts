import express from "express";
import { FavoriteController } from "../controllers/favorite.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();
const favoriteController = new FavoriteController();

// All favorite routes require authentication
router.post("/toggle", authenticateUser, (req, res) => favoriteController.toggleFavorite(req, res));
router.get("/", authenticateUser, (req, res) => favoriteController.getUserFavorites(req, res));
router.get("/:productId", authenticateUser, (req, res) => favoriteController.checkFavorite(req, res));

export default router;
