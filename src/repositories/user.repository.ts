import { User } from "../models/user.model"; // Changed from UserModel to User
import { IUser } from "../types/user.type"; // Import from types file, not model file

export class UserRepository {
    // 1. Create User
    async createUser(data: Partial<IUser>) {
        return await User.create(data);
    }

    // 2. Get User by Email
    async getUserByEmail(email: string) {
        return await User.findOne({ email }).select("+password"); // select password for login check
    }

    async getUserByEmailWithOTP(email: string) {
        return await User.findOne({ email }).select("+resetPasswordOTP +resetPasswordOTPExpires");
    }

    // 3. Get User by Phone (Required by our updated UserService)
    async getUserByPhoneNumber(phoneNumber: string) {
        return await User.findOne({ phoneNumber });
    }

    // 4. Get User by ID
    async getUserById(id: string) {
        return await User.findById(id);
    }

    // 5. Get All Users (Admin) - With Pagination
    async getAllUsers(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // 6. Update User
    async updateUser(id: string, data: Partial<IUser>) {
        return await User.findByIdAndUpdate(id, data, { new: true }).select("-password");
    }

    // 7. Delete User
    async deleteUser(id: string) {
        return await User.findByIdAndDelete(id);
    }
}