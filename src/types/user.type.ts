import { Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber: string;
  address: string;
  role: "user" | "admin";
  createdAt: Date;
}