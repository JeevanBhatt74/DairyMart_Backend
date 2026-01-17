import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

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
}