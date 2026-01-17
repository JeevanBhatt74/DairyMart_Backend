import mongoose from 'mongoose';
import { MONGO_URI } from '../config';

export const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.error("❌ Database Connection Failed", error);
        process.exit(1);
    }
};