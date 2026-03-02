import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import app from './app';
import { createServer } from 'http';
import SocketService from './utils/socket';
import os from 'os';

function getIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        if (iface) {
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
    return 'localhost';
}

async function start() {
    try {
        await connectDatabase();

        const portNumber = Number(process.env.PORT || PORT) || 5000;
        const ipAddress = getIpAddress();

        const httpServer = createServer(app);
        SocketService.init(httpServer);

        httpServer.listen(portNumber, '0.0.0.0', () => {
            console.log(`🚀 Server started successfully`);
            console.log(`📡 Local Access: http://localhost:${portNumber}`);
            console.log(`📱 Mobile Access: http://${ipAddress}:${portNumber}/api/v1/users`);
        });

        // Handle errors after listening
        httpServer.on('error', (error) => {
            console.error("❌ HTTPServer Error:", error);
            process.exit(1);
        });

    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
}

// Global exception handlers to catch silent crashes
process.on('uncaughtException', (error) => {
    console.error("🔥 Uncaught Exception:", error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("🌊 Unhandled Rejection at:", promise, "reason:", reason);
});

start();