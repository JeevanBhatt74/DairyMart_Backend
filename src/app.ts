import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";
import cartRoutes from "./routes/cart.route";
import favoriteRoutes from "./routes/favorite.route";
import paymentRoutes from "./routes/payment.route";
import notificationRoutes from "./routes/notification.route";
import adminAccountRoutes from "./routes/admin_account.route";
import chatRoutes from "./routes/chat.route";
import loyaltyRoutes from "./routes/loyalty.route";
import { errorHandler } from "./middleware/error.middleware";

const app: Application = express();

app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins for now to fix connectivity, but with proper credential support
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'))); // Fallback for root access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/users', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin-account', adminAccountRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/loyalty', loyaltyRoutes);

app.get('/api/ping', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "pong" });
});

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "DairyMart API is Running"
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

export default app;
