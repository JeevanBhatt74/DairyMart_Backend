import express from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();
const paymentController = new PaymentController();

// Esewa
router.post("/initiate/esewa", (req, res) => paymentController.initiateEsewa(req, res));
router.get("/callback/esewa", (req, res) => paymentController.verifyEsewa(req, res));

// Khalti
router.post("/initiate/khalti", (req, res) => paymentController.initiateKhalti(req, res));
router.get("/callback/khalti", (req, res) => paymentController.verifyKhalti(req, res));

export default router;
