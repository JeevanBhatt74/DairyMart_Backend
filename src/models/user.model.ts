import { Schema, model } from "mongoose";
import { IUser } from "../types/user.type";

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // select: false hides password by default
  phoneNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profilePicture: { type: String, default: null, required: false },
  createdAt: { type: Date, default: Date.now },
});

// Export as 'User' to match the repository import
export const User = model<IUser>("User", userSchema);