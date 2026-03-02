import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class EmailService {
    private transporter;

    constructor() {
        console.log("Initializing EmailService (Nodemailer)...");

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (!emailUser || !emailPass) {
            console.error("🔴 EMAIL_USER or EMAIL_PASS is missing in .env file!");
        } else {
            console.log("✅ Email credentials found.");
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
    }

    async sendOTP(email: string, otp: string) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("🔴 Missing EMAIL_USER or EMAIL_PASS in .env file!");
            console.log("⚠️ DEV MODE: Email sent logic skipped. OTP is:", otp);
            return true;
        }

        try {
            console.log(`Attempting to send OTP to ${email} via Gmail...`);

            const mailOptions = {
                from: `"DairyMart" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'DairyMart Password Reset OTP',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #29ABE2;">Password Reset</h1>
                        <p>Your OTP for password reset is:</p>
                        <h2 style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; letter-spacing: 5px;">${otp}</h2>
                        <p>It expires in 10 minutes.</p>
                        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log(`✅ OTP sent successfully to ${email}`);
            console.log("Message ID:", info.messageId);
            return true;

        } catch (error: any) {
            console.error('🔴 Error sending email:', error);
            console.log("⚠️ DEV MODE (Fallback): OTP is:", otp);
            return false;
        }
    }
}
