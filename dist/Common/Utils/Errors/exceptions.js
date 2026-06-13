"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestsException = exports.InternalServerErrorException = exports.BadRequestException = exports.NotFoundException = exports.ConflictException = void 0;
const app_error_js_1 = require("./app-error.js");
class ConflictException extends app_error_js_1.HttpAppError {
    constructor(message = 'Conflict', details = null) {
        super(message, 409, 'CONFLICT', details);
    }
}
exports.ConflictException = ConflictException;
class NotFoundException extends app_error_js_1.HttpAppError {
    constructor(message = 'Not Found', details = null) {
        super(message, 404, 'NOT_FOUND', details);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends app_error_js_1.HttpAppError {
    constructor(message = 'Bad Request', details = null) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}
exports.BadRequestException = BadRequestException;
class InternalServerErrorException extends app_error_js_1.HttpAppError {
    constructor(message = 'Internal Server Error', details = null) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class TooManyRequestsException extends app_error_js_1.HttpAppError {
    constructor(message = 'Too Many Requests', details = null) {
        super(message, 429, 'TOO_MANY_REQUESTS', details);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
