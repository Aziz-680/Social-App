"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAppError = void 0;
class HttpAppError extends Error {
    constructor(message = 'An error occured', statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HttpAppError = HttpAppError;
