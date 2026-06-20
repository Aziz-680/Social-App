export class HttpAppError extends Error {
    public statusCode: number;
    public code: string;
    public details: any;

    constructor (message = 'An error occured', statusCode = 500, code = 'INTERNAL_ERROR', details: any = null) {
        super(message);
        
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}