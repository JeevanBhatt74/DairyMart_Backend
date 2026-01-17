import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authController = new AuthController();
const router = Router();

// Wrap async methods to catch errors if not using an async wrapper middleware
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

export default router;