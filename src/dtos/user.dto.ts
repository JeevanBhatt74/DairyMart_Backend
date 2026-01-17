import { z } from "zod";

/**
 * DTO for User Registration
 * Integrated with: phoneNumber, locationId, and address
 */
export const CreateUserDTO = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required").optional(),
    
    // --- REQUIRED FIELDS ---
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Detailed address is required"),
    
    // Optional fields
    profilePicture: z.string().url("Invalid URL format").optional().nullable(),
    role: z.enum(["user", "admin"]).optional().default("user")
}).refine(
    (data) => {
        if (data.confirmPassword) {
            return data.password === data.confirmPassword;
        }
        return true;
    }, 
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password is required")
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;