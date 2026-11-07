import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const requestedStatus = Number(err?.statusCode);
    const statusCode = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
        ? requestedStatus
        : 500;
    const isExpectedError = statusCode < 500;

    // Authentication and other expected client errors are not backend failures.
    if (!isExpectedError) {
        console.error('Unhandled backend error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message: isExpectedError && typeof err?.message === 'string'
            ? err.message
            : 'Internal Server Error',
        code: isExpectedError && typeof err?.code === 'string'
            ? err.code
            : 'INTERNAL_SERVER_ERROR',
        details: isExpectedError ? (err?.details ?? null) : null,
    });
};