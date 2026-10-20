import express, { Application, NextFunction, Request, Response } from 'express';
import { envConfig } from './config';
import { authController, commentController, postController, userController } from './Modules';
import { dbConnection } from './DB/db.connection.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path'; 
import friendController from './Modules/Friend/friend.controller';

const app: Application = express();

// 1. Initialize Common Middlewares First
function initializeCommonMiddlewares(app: Application) {
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: 'http://localhost:3001', 
        credentials: true
    }));

    app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
}

// 2. Initialize Controllers
function initializeControllers(app: Application) {
    // Project controllers
    app.use('/api/auth', authController);
    app.use('/api/user', userController);
    app.use('/api/post', postController);
    app.use('/api/comment', commentController);
    app.use('/api/friend', friendController);

    // Health check route
    app.get('/', (_req: Request, res: Response) => {
        res.json({ message: "Welcome to the Express + TypeScript Server!" });
    });

    // Catch-all 404 handler for undefined routes
    app.use((req: Request, res: Response) => {
        res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
    });

    // Global Error Handler Middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Unhandled Backend Error:", err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            message: err.message || "Internal Server Error",
            error: err
        });
    });
}

// Execute setup in correct order
initializeCommonMiddlewares(app);
initializeControllers(app);

// Database Connection
dbConnection();

const port: number | string = envConfig.app.port;
app.listen(port, () => {
    console.log('Server is running on port', port);
});