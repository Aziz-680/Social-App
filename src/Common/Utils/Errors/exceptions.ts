import { HttpAppError  } from "./app-error.js";
import { IHttpAppError } from "../../Types/interface.types";


export class ConflictException extends HttpAppError {
    constructor(message = 'Conflict', details = null) {
        super(message , 409 , 'CONFLICT' , details)
    }
}

export class NotFoundException extends HttpAppError {
    constructor(message = 'Not Found', details = null) {
        super(message , 404 , 'NOT_FOUND' , details)
    }
}


export class UnauthorizedException extends HttpAppError {
    constructor(message = 'Unauthorized', details = null) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

export class ForbiddenException extends HttpAppError {
    constructor(message = 'Forbidden', details = null) {
        super(message, 403, 'FORBIDDEN', details);
    }
}

export class BadRequestException extends Error implements IHttpAppError {
    public statusCode = 400;
    public code = 'BAD_REQUEST';
    public details: unknown; // Added details property

    // Accept an optional details argument here
    constructor(message: string, details?: unknown) {
        super(message);
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InternalServerErrorException extends HttpAppError {
    constructor(message = 'Internal Server Error', details = null) {
        super(message , 500 , 'INTERNAL_SERVER_ERROR' , details)
    }
}

export class TooManyRequestsException extends HttpAppError {
    constructor(message = 'Too Many Requests', details = null) {
        super(message , 429 , 'TOO_MANY_REQUESTS' , details)
    }
}

