import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

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
}