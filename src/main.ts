import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { envConfig } from './config';
import { authController, chatController, commentController, notificationController, postController, userController } from './Modules';
import { dbConnection } from './DB/db.connection.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import friendController from './Modules/Friend/friend.controller';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { globalErrorHandler } from './Middlewares/global-error-handler.middleware';
import { initializeChatSocket } from './Modules/Chat/chat.socket';

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
    app.use('/api/chat', chatController);
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

    // Keep the error handler last so errors passed through next(error) reach it.
    app.use(globalErrorHandler);
}

// Execute setup in correct order
initializeCommonMiddlewares(app);
initializeControllers(app);

const startServer = async () => {
    await dbConnection();
    const server = createServer(app);
    const io = initializeChatSocket(server);
    server.listen(envConfig.app.port, () => {
        console.log(`Server is listening on port ${envConfig.app.port}`);
    });

    const shutdown = (signal: string) => {
        console.log(`${signal} received; shutting down`);
        io.close(() => {
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