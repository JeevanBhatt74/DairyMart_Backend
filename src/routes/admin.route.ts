import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { profileImageUpload } from "../config/multer";

const router = Router();
const adminController = new AdminController();

// Protect all routes with auth + admin middleware
router.use(authenticateUser, isAdmin);

// GET /api/admin/users
router.get("/users", (req, res) => adminController.getAllUsers(req, res));

// POST /api/admin/users (with image upload)
router.post("/users", profileImageUpload.single("profilePicture"), (req, res) => adminController.createUser(req, res));

// GET /api/admin/users/:id
router.get("/users/:id", (req, res) => adminController.getUserById(req, res));

// PUT /api/admin/users/:id (with image upload)
router.put("/users/:id", profileImageUpload.single("profilePicture"), (req, res) => adminController.updateUser(req, res));

// DELETE /api/admin/users/:id
router.delete("/users/:id", (req, res) => adminController.deleteUser(req, res));

export default router;
