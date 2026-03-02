import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import Order from "../models/order.model";
import { AdminAccount } from "../models/admin_account.model";

export class PaymentController {

    // --- Esewa Integration ---
    async initiateEsewa(req: Request, res: Response) {
        try {
            const { orderId, amount, successUrl, failureUrl } = req.body;

            if (!orderId || !amount) {
                return res.status(400).json({ success: false, message: "Order ID and Amount are required" });
            }

            const transaction_uuid = `${orderId}-${Date.now()}`;
            const product_code = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
            const secret_key = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

            // Signature generation: TotalAmount,TransactionUuid,ProductCode
            const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
            const signature = crypto.createHmac("sha256", secret_key).update(signatureString).digest("base64");

            // Allow client to specify redirect URLs (useful for mobile deep links)
            const clientSuccessUrl = successUrl || "http://localhost:3000/payment/success";
            const clientFailureUrl = failureUrl || "http://localhost:3000/payment/failure";

            const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.headers.host}`;

            const esewaConfig = {
                amount: amount,
                tax_amount: 0,
                total_amount: amount,
                transaction_uuid: transaction_uuid,
                product_code: product_code,
                product_service_charge: 0,
                product_delivery_charge: 0,
                success_url: `${baseUrl}/api/payment/callback/esewa?orderId=${orderId}&successUrl=${encodeURIComponent(clientSuccessUrl)}&failureUrl=${encodeURIComponent(clientFailureUrl)}`, // Backend callback
                failure_url: clientFailureUrl, // Frontend failure page
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature: signature,
                esewa_url: process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
            };

            await Order.findByIdAndUpdate(orderId, {
                "paymentDetails.method": "ESEWA",
                "paymentDetails.transactionId": transaction_uuid
            });
            console.log("Esewa Config Generated:", JSON.stringify(esewaConfig, null, 2));

            res.status(200).json({ success: true, data: esewaConfig });
        } catch (error: any) {
            const fs = require('fs');
            fs.appendFileSync('backend-errors.log', `${new Date().toISOString()} - Payment Init Error: ${error.message}\n${error.stack}\n`);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async verifyEsewa(req: Request, res: Response) {
        try {
            let { data, orderId, successUrl, failureUrl } = req.query;

            console.log("Esewa Callback req.query:", req.query);

            if (!data) {
                const urlParts = req.url.split('?data=');
                if (urlParts.length > 1) {
                    data = urlParts[1].split('&')[0];
                }
            }

            if (!data) {
                return res.status(400).json({ success: false, message: "Invalid callback data" });
            }

            const decodedData = JSON.parse(Buffer.from(data as string, "base64").toString("utf-8"));
            const { total_amount, transaction_uuid, product_code, signature: receivedSignature } = decodedData;
            const secret_key = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

            const message = decodedData.signed_field_names
                .split(',')
                .map((field: string) => `${field}=${decodedData[field]}`)
                .join(',');

            const generatedSignature = crypto.createHmac("sha256", secret_key).update(message).digest("base64");

            if (receivedSignature !== generatedSignature) {
                return res.status(400).json({ success: false, message: "Signature verification failed" });
            }

            const clientSuccessUrl = (successUrl as string) || "http://localhost:3000/payment/success";
            const clientFailureUrl = (failureUrl as string) || "http://localhost:3000/payment/failure";

            if (decodedData.status !== "COMPLETE") {
                return res.redirect(clientFailureUrl);
            }

            let extractedOrderId = orderId;
            if (transaction_uuid && typeof transaction_uuid === 'string') {
                const parts = transaction_uuid.split('-');
                if (parts.length >= 2) {
                    extractedOrderId = parts[0];
                }
            }

            await Order.findByIdAndUpdate(extractedOrderId, {
                "paymentDetails.status": "COMPLETED",
                "paymentDetails.transactionId": transaction_uuid,
                status: "Processing"
            });

            if (total_amount) {
                await AdminAccount.addRevenue(Number(total_amount));
            }

            res.redirect(`${clientSuccessUrl}?orderId=${extractedOrderId}`);

        } catch (error: any) {
            console.error("Esewa Verification Error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // --- Khalti Integration ---
    async initiateKhalti(req: Request, res: Response) {
        try {
            const { orderId, amount, name, email, phone, successUrl, failureUrl } = req.body;

            if (!orderId || !amount) {
                return res.status(400).json({ success: false, message: "Order ID and Amount are required" });
            }

            const clientSuccessUrl = successUrl || "http://localhost:3000/payment/success";
            const clientFailureUrl = failureUrl || "http://localhost:3000/payment/failure";

            const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.headers.host}`;

            const paymentData = {
                return_url: `${baseUrl}/api/payment/callback/khalti?successUrl=${encodeURIComponent(clientSuccessUrl)}&failureUrl=${encodeURIComponent(clientFailureUrl)}`,
                website_url: "http://localhost:3000",
                amount: Math.round(amount * 100), // Convert to Paisa securely
                purchase_order_id: orderId,
                purchase_order_name: `Order ${orderId}`,
                customer_info: {
                    name: name || "Customer",
                    email: email || "customer@example.com",
                    phone: phone || "9800000000"
                }
            };

            const response = await axios.post(
                process.env.KHALTI_GATEWAY_URL!,
                paymentData,
                {
                    headers: {
                        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            await Order.findByIdAndUpdate(orderId, {
                "paymentDetails.method": "KHALTI",
                "paymentDetails.pidx": response.data.pidx
            });

            res.status(200).json({ success: true, data: response.data });
        } catch (error: any) {
            console.error("Khalti Init Error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || "Failed to initiate Khalti payment";
            res.status(400).json({ success: false, message: errorMessage, errorDetails: error.response?.data });
        }
    }

    async verifyKhalti(req: Request, res: Response) {
        try {
            const { pidx, successUrl, failureUrl } = req.query;

            if (!pidx) {
                return res.status(400).json({ success: false, message: "PIDX required" });
            }

            const clientSuccessUrl = (successUrl as string) || "http://localhost:3000/payment/success";
            const clientFailureUrl = (failureUrl as string) || "http://localhost:3000/payment/failure";

            // Verify with Khalti Lookup API
            const response = await axios.post(
                "https://a.khalti.com/api/v2/epayment/lookup/",
                { pidx },
                {
                    headers: {
                        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const { status, total_amount, purchase_order_id } = response.data;

            if (status === "Completed") {
                await Order.findByIdAndUpdate(purchase_order_id, {
                    "paymentDetails.status": "COMPLETED",
                    "paymentDetails.pidx": pidx,
                    status: "Processing"
                });

                if (total_amount) {
                    await AdminAccount.addRevenue(Number(total_amount) / 100); // Khalti returns paisa
                }

                res.redirect(`${clientSuccessUrl}?orderId=${purchase_order_id}`);
            } else {
                res.redirect(clientFailureUrl);
            }

        } catch (error: any) {
            console.error("Khalti Verification Error:", error.response?.data || error.message);
            res.status(500).json({ success: false, message: "Payment verification failed" });
        }
    }
}
// Triggering backend restart
