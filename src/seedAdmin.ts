import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDatabase } from "./database/mongodb";
import { User } from "./models/user.model";
import bcrypt from "bcryptjs";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDatabase();

        const adminEmail = "admin@dairymart.com";
        const adminPassword = "admin123";

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            // Optional: Ensure role is admin
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log("Updated existing user to admin role.");
            }
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const newAdmin = new User({
                fullName: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                phoneNumber: "9800000000",
                address: "Headquarters",
                role: "admin"
            });

            await newAdmin.save();
            console.log("Admin user created successfully.");
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
