import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config'; // Ensure this points to your config file
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";

const app: Application = express();

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/users', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "DairyMart API is Running",
        server_ip: "10.12.35.23"
    });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// ==========================================
// Start Server
// ==========================================

async function start() {
    try {
        await connectDatabase();

        /**
         * FIX: Convert PORT to a Number using Number(PORT)
         * This resolves the "Argument of type string is not assignable to number" error.
         */
        console.log("DEBUG: process.env.PORT =", process.env.PORT);
        console.log("DEBUG: Config PORT =", PORT);
        const portNumber = Number(process.env.PORT || PORT) || 5000;

        app.listen(portNumber, '0.0.0.0', () => {
            console.log(`🚀 Server started successfully`);
            console.log(`📡 Local Access: http://localhost:${portNumber}`);
            console.log(`📱 Mobile Access: http://10.181.70.216:${portNumber}/api/v1/users`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
}

start();