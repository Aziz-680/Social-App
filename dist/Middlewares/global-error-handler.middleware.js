"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, _req, res, _next) => {
    var _a;
    const requestedStatus = Number(err === null || err === void 0 ? void 0 : err.statusCode);
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
        message: isExpectedError && typeof (err === null || err === void 0 ? void 0 : err.message) === 'string'
            ? err.message
            : 'Internal Server Error',
        code: isExpectedError && typeof (err === null || err === void 0 ? void 0 : err.code) === 'string'
            ? err.code
            : 'INTERNAL_SERVER_ERROR',
        details: isExpectedError ? ((_a = err === null || err === void 0 ? void 0 : err.details) !== null && _a !== void 0 ? _a : null) : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
