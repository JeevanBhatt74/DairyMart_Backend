import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import { IUser } from "../types/user.type";

const userRepository = new UserRepository();

export class AdminController {
    // 1. Get All Users
    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await userRepository.getAllUsers(page, limit);

            res.status(200).json({
                success: true,
                data: result.users,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            });
        } catch (error) {
            console.error("Get All Users Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 2. Get User By ID
    async getUserById(req: Request, res: Response) {
        try {
            const user = await userRepository.getUserById(req.params.id);
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 3. Create User (Admin)
    async createUser(req: Request, res: Response) {
        try {
            const { fullName, email, password, phoneNumber, address, role } = req.body;

            // Check if user exists
            const existingUser = await userRepository.getUserByEmail(email);
            if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);

            const userData: Partial<IUser> = {
                fullName,
                email,
                password: hashedPassword,
                phoneNumber,
                address,
                role: role || "user",
                profilePicture: req.file ? `/public/profile_picture/${req.file.filename}` : undefined
            };

            const newUser = await userRepository.createUser(userData);
            res.status(201).json({ success: true, message: "User created successfully", data: newUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 4. Update User
    async updateUser(req: Request, res: Response) {
        try {
            const updates = req.body;
            if (req.file) {
                updates.profilePicture = `/public/profile_picture/${req.file.filename}`;
            }

            // If updating password, hash it
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            const updatedUser = await userRepository.updateUser(req.params.id, updates);
            if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

            res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
        } catch (error) {
            console.error("Update User Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

    // 5. Delete User
    async deleteUser(req: Request, res: Response) {
        try {
            const deletedUser = await userRepository.deleteUser(req.params.id);
            if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
            res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }
}
