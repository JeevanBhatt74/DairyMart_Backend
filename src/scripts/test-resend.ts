
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Parse .env from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log("--- Resend Configuration Test ---");
console.log("Current Directory:", process.cwd());
console.log("Looking for .env at:", path.join(__dirname, '../../.env'));

const apiKey = process.env.RESEND_API_KEY;
console.log("RESEND_API_KEY:", apiKey ? "DEFINED (" + apiKey.substring(0, 5) + "...)" : "MISSING");

const runTest = async () => {
    if (!apiKey) {
        console.error("❌ RESEND_API_KEY missing. Please check .env file.");
        return;
    }

    const resend = new Resend(apiKey);

    console.log("\nSending Test Email...");
    try {
        // Fetch user profile to get the registered email (imperfect but good guess)
        // Or just ask user. For now, we try to send to a generic one which might fail if not registered.
        // BETTER: Ask user to check console logs.

        console.log("NOTE: On Resend Free Tier, you can ONLY send to the email you signed up with.");

        const data = await resend.emails.send({
            from: 'DairyMart <onboarding@resend.dev>',
            to: 'served_by_resend_free_tier@example.com', // This will likely fail if not the registered email
            subject: 'DairyMart Resend Test',
            html: '<strong>It works!</strong>'
        });

        if (data.error) {
            console.error("❌ Resend API Error:", data.error);
            if (data.error.message.includes("resend.com/domains")) {
                console.error("👉 CAUSE: You are trying to send to an email that is NOT verified.");
                console.error("   On Free Tier, you can ONLY send to the email address you used to sign up.");
                console.error("   Solution: Try Forgot Password with YOUR registered email.");
            }
        } else {
            console.log("✅ Email queued successfully!");
            console.log("ID:", data.data?.id);
        }
    } catch (error: any) {
        console.error("❌ Unexpected Error:", error.message);
    }
};

runTest();
