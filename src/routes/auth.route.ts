import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AdminController } from "../controllers/admin.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { profileImageUpload } from "../config/multer";

const authController = new AuthController();
const adminController = new AdminController();
const router = Router();

// Wrap async methods to catch errors if not using an async wrapper middleware
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// Upload Profile Picture Route
router.post(
  "/upload-profile-picture",
  authenticateUser,
  profileImageUpload.single('profilePicture'),
  (req, res) => authController.uploadProfilePicture(req, res)
);

// Get Logged In User Profile (GET /api/auth/:id)
// Get Logged In User Profile (GET /api/auth/:id)
router.get(
  "/:id",
  authenticateUser,
  (req: any, res) => {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    adminController.getUserById(req, res);
  }
);

router.put(
  "/:id",
  authenticateUser,
  profileImageUpload.single("profilePicture"),
  (req: any, res) => {
    // Security check: User can only update themselves
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this profile" });
    }
    adminController.updateUser(req, res);
  }
);

export default router;