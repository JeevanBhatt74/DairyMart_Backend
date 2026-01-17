import express, { Application, Request, Response } from 'express';
import cors from 'cors'; 
import bodyParser from 'body-parser';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config'; // Ensure this points to your config file
import authRoutes from "./routes/auth.route";

const app: Application = express();

// ==========================================
// Middleware
// ==========================================

app.use(cors({
    origin: '*', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// Routes
// ==========================================

app.use('/api/v1/users', authRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ 
        success: true, 
        message: "DairyMart API is Running",
        server_ip: "10.12.35.23" 
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
        const portNumber = Number(PORT) || 3000;

        app.listen(portNumber, '0.0.0.0', () => {
            console.log(`🚀 Server started successfully`);
            console.log(`📡 Local Access: http://localhost:${portNumber}`);
            console.log(`📱 Mobile Access: http://10.12.35.23:${portNumber}/api/v1/users`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
}

start();