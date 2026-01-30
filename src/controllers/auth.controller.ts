import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { User } from "../models/user.model";
import fs from "fs";

const userService = new UserService();

export class AuthController {
    
    // Register User
    register = async (req: Request, res: Response) => {
        try {
            // 1. Validate data using Zod schema
            const parsedData = CreateUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: parsedData.error.flatten().fieldErrors 
                });
            }

            // 2. Call service to create user (Service will hash password)
            const result = await userService.createUser(parsedData.data);

            // 3. Return response exactly as Flutter AuthRemoteDataSource expects
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                token: result.token, // Flutter needs this
                data: result.user
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Login User
    login = async (req: Request, res: Response) => {
        try {
            // 1. Validate input
            const parsedData = LoginUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: parsedData.error.flatten().fieldErrors
                });
            }

            // 2. Call service to verify credentials and get token and user data
            const { token, data: user } = await userService.loginUser(parsedData.data);

            // 3. Return response
            return res.status(200).json({
                success: true,
                message: "Login successful",
                token, // Flutter uses response.data['token']
                data: user
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Upload Profile Picture
    uploadProfilePicture = async (req: Request, res: Response) => {
        try {
            // Validate file upload
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // Get user ID from authenticated request
            const userId = (req as any).user?.id || (req as any).user?.userId || (req as any).user?._id || (req as any).userId;
            
            if (!userId) {
                console.error('🔴 No user ID found in request. Decoded token:', (req as any).user);
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User ID not found'
                });
            }
            
            console.log('✅ User ID extracted:', userId);

            // Construct image URL (adjust your backend URL)
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
            const imageUrl = `${baseUrl}/public/profile_picture/${req.file.filename}`;

            // Update user in database
            const user = await User.findByIdAndUpdate(
                userId,
                { profilePicture: imageUrl },
                { new: true }
            );

            if (!user) {
                // Delete uploaded file if user not found
                if (req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Send success response
            return res.status(200).json({
                success: true,
                imageUrl: imageUrl,
                data: {
                    profilePicture: imageUrl,
                    user: user
                },
                message: 'Profile picture uploaded successfully'
            });

        } catch (error: any) {
            // Delete uploaded file if error occurs
            if (req.file?.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (e) {
                    console.error('Error deleting file:', e);
                }
            }
            console.error('Upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload profile picture',
                error: error.message
            });
        }
    }
}