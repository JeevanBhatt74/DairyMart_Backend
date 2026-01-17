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

    // 3. Get User by Phone (Required by our updated UserService)
    async getUserByPhoneNumber(phoneNumber: string) {
        return await User.findOne({ phoneNumber });
    }

    // 4. Get User by ID
    async getUserById(id: string) {
        return await User.findById(id);
    }
}