import express, { Application, NextFunction, Request, Response } from 'express';
import { envConfig } from './config';
import { authController, commentController, notificationController, postController, userController } from './Modules';
import { dbConnection } from './DB/db.connection.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import friendController from './Modules/Friend/friend.controller';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const app: Application = express();
app.set('trust proxy', envConfig.app.trustProxyHops);

// 1. Initialize Common Middlewares First
function initializeCommonMiddlewares(app: Application) {
    app.use(helmet());
    app.use(express.json({ limit: '1mb' }));
    app.use(cookieParser());
    app.use(cors({
        origin: envConfig.app.corsOrigins,
        credentials: true
    }));

    const authRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { message: 'Too many authentication attempts. Try again later.' },
    });
    app.use(['/api/auth/login', '/api/auth/register', '/api/auth/google'], authRateLimit);
}

// 2. Initialize Controllers
function initializeControllers(app: Application) {
    // Project controllers
    app.use('/api/auth', authController);
    app.use('/api/user', userController);
    app.use('/api/post', postController);
    app.use('/api/comment', commentController);
    app.use('/api/notification', notificationController);
    app.use('/api/friend', friendController);

    // Liveness is process-only; readiness also verifies the database connection.
    app.get('/health/live', (_req: Request, res: Response) => {
        res.status(200).json({ status: 'ok' });
    });
    app.get('/health/ready', (_req: Request, res: Response) => {
        const isReady = mongoose.connection.readyState === 1;
        res.status(isReady ? 200 : 503).json({ status: isReady ? 'ready' : 'not_ready' });
    });

    app.get('/', (_req: Request, res: Response) => {
        res.json({ message: "Welcome to the Social App API" });
    });

    // Catch-all 404 handler for undefined routes
    app.use((req: Request, res: Response) => {
        res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
    });

    // Global Error Handler Middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Unhandled Backend Error:", err);
        const requestedStatus = Number(err.statusCode);
        const statusCode = requestedStatus >= 400 && requestedStatus < 500 ? requestedStatus : 500;
        res.status(statusCode).json({
            message: statusCode === 500 ? "Internal Server Error" : (err.message || "Request failed"),
        });
    });
}

// Execute setup in correct order
initializeCommonMiddlewares(app);
initializeControllers(app);

const startServer = async () => {
    await dbConnection();
    const server = app.listen(envConfig.app.port, () => {
        console.log(`Server is listening on port ${envConfig.app.port}`);
    });

    const shutdown = (signal: string) => {
        console.log(`${signal} received; shutting down`);
        server.close(() => {
            void mongoose.disconnect().finally(() => process.exit(0));
        });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
    console.error('Application startup failed:', error);
    void mongoose.disconnect().finally(() => process.exit(1));
});