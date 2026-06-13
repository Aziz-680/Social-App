"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const config_1 = require("../config"); // Adjust import path if needed
const globalErrorHandler = (err, req, res, next) => {
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
        stack: config_1.envConfig.app.nodeEnv === 'dev' ? err.stack : undefined
    });
};
exports.globalErrorHandler = globalErrorHandler;
