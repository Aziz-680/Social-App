import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config'; // Adjust import path if needed

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Determine if it's a known operational error or an unknown bug
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const details = err.details || null;

    // Send standardized error response
    res.status(statusCode).json({
        success: false,
        message,
        code,
        details,
        // Only show the stack trace in development mode for debugging
        stack: envConfig.app.nodeEnv === 'dev' ? err.stack : undefined
    });
};