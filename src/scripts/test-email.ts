
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Parse .env from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log("--- Email Configuration Test ---");
console.log("Current Directory:", process.cwd());
console.log("Looking for .env at:", path.join(__dirname, '../../.env'));
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "DEFINED" : "MISSING");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "DEFINED" : "MISSING");

const runTest = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Credentials missing. Please check .env file.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    console.log("\nVerifying SMTP connection...");
    try {
        await transporter.verify();
        console.log("✅ SMTP Connection Verified!");
    } catch (error: any) {
        console.error("❌ SMTP Connection Failed:", error.message);
        if (error.responseCode === 535) {
            console.error("👉 This usually means 'Invalid Credentials'.");
            console.error("   1. Check your email spelling.");
            console.error("   2. If using Gmail, you MUST use an 'App Password', not your login password.");
            console.error("   3. Make sure 2-Step Verification is enabled on your Google Account.");
        }
        return;
    }

    console.log("\nSending Test Email...");
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: "DairyMart Test Email",
            text: "If you see this, email sending is working!"
        });
        console.log("✅ Email Sent!");
        console.log("Message ID:", info.messageId);
        console.log("Check your inbox (and spam folder) for an email from yourself.");
    } catch (error: any) {
        console.error("❌ Send Mail Failed:", error.message);
    }
};

runTest();
