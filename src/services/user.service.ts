import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { EmailService } from "./email.service";

const userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO) {
        // 1. Check if email is unique
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, "Email already in use");
        }

        /**
         * 2. Check if phone number is unique 
         * (DairyMart uses phone numbers as primary contact)
         */

        // 3. Hash Password
        const hashedPassword = await bcryptjs.hash(data.password, 10);

        // 4. Save User 
        // We remove 'confirmPassword' and map DTO fields to the User Model
        const { confirmPassword, ...userData } = data;

        const newUser = await userRepository.createUser({
            ...userData,
            password: hashedPassword
        });

        /**
         * 5. Generate Token immediately after signup (Optional but standard)
         */
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        return { token, user: newUser };
    }

    async loginUser(data: LoginUserDTO) {
        // 1. Check User exists by email
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // 2. Check Password
        // user.password! uses the non-null assertion because MongoDB includes it here
        const validPassword = await bcryptjs.compare(data.password, user.password!);
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }

        // 3. Generate JWT Token
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        // 4. Return both token and user data to the Flutter app
        return {
            success: true,
            token,
            data: user
        };
    }

    async forgotPassword(email: string) {
        // Account Enumeration Protection: Always return success message even if user doesn't exist.
        // We simulate a DB call time if user is not found to prevent timing attacks (basic mitigation).
        const user = await userRepository.getUserByEmail(email);

        if (!user) {
            // Fake delay to mimic processing time
            await new Promise(resolve => setTimeout(resolve, 200));
            // Return generic message
            return { message: "If an account with that email exists, an OTP has been sent." };
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Security: Hash the OTP before saving to DB so DB admins cannot see it
        const salt = await bcryptjs.genSalt(10);
        const hashedOTP = await bcryptjs.hash(otp, salt);

        // Save to DB (expires in 15 mins)
        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Send Email with PLAIN OTP
        const emailService = new EmailService();
        const emailSent = await emailService.sendOTP(email, otp);

        if (!emailSent) {
            // In a real strict environment, you might log this internally but still return the generic message 
            // to the user to avoid revealing email validity. 
            // However, for UX, if sending fails, it's often better to know. 
            // We'll stick to the generic success to be strictly secure given the prompt.
            console.error(`Failed to send OTP to ${email}`);
        }

        return { message: "If an account with that email exists, an OTP has been sent." };
    }

    async verifyOTP(email: string, otp: string) {
        // We need to fetch the user including the hidden OTP fields
        const user = await userRepository.getUserByEmailWithOTP(email);

        if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
            // Generic error to avoid revealing state
            throw new HttpError(400, "Invalid or expired OTP");
        }

        if (user.resetPasswordOTPExpires < new Date()) {
            throw new HttpError(400, "Invalid or expired OTP");
        }

        // Verify Hash
        const isValid = await bcryptjs.compare(otp, user.resetPasswordOTP);
        if (!isValid) {
            throw new HttpError(400, "Invalid or expired OTP");
        }

        return { success: true, message: "OTP verified" };
    }

    async resetPassword(email: string, otp: string, newPassword: string) {
        const user = await userRepository.getUserByEmailWithOTP(email);

        if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
            throw new HttpError(400, "Invalid request");
        }

        if (user.resetPasswordOTPExpires < new Date()) {
            throw new HttpError(400, "Invalid or expired OTP");
        }

        // Verify OTP again (crucial step, stateless verify is not enough for the final action)
        const isValid = await bcryptjs.compare(otp, user.resetPasswordOTP);
        if (!isValid) {
            throw new HttpError(400, "Invalid or expired OTP");
        }

        // Hash new password
        user.password = await bcryptjs.hash(newPassword, 10);

        // Clear OTP fields to prevent replay
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        return { success: true, message: "Password reset successfully" };
    }
}