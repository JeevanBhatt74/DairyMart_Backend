import express from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { profileImageUpload } from "../config/multer"; // Reusing existing multer config

const router = express.Router();
const productController = new ProductController();

// Public Routes (Optional: if we want public to see products via this API)
// For now, let's keep it protected or create a separate public route. 
// Assuming this is ADMIN route mainly.

// GET All - Protected but maybe accessible to all logged in users? 
// For admin panel it's strictly admin, but for store it might be public.
// Let's make GET / accessible to all authenticated users for now, or public?
// Given this is under /api/products, usually public.
// But the user requested "/admin/product page", so let's make these admin management routes.
// We can have a separate Public Product route if needed later.

// Admin Management Routes
router.post(
    "/",
    authenticateUser,
    isAdmin,
    profileImageUpload.single("image"), // Using 'image' field
    (req, res) => productController.createProduct(req, res)
);

router.get(
    "/",
    // authenticateUser, // Maybe public? Let's keep it open for now so frontend can fetch easily
    (req, res) => productController.getAllProducts(req, res)
);

router.get(
    "/:id",
    (req, res) => productController.getProductById(req, res)
);

router.put(
    "/:id",
    authenticateUser,
    isAdmin,
    profileImageUpload.single("image"),
    (req, res) => productController.updateProduct(req, res)
);

router.delete(
    "/:id",
    authenticateUser,
    isAdmin,
    (req, res) => productController.deleteProduct(req, res)
);

export default router;
