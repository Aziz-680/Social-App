import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestException } from "../Common/Utils"; // Adjust path if needed

type RequestKey = keyof Request;
type SchemaType = Partial<Record<RequestKey, ZodType>>;

const validation = (schema: SchemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // 1. Explicitly type this as an array of Zod issues to appease TS
        const validationErrors: any[] = [];
        
        for (const key in schema) {
            const validkey = key as RequestKey;
            const result = schema[validkey]?.safeParse(req[validkey]);

            if (result && !result.success) {
                // 2. USE THE SPREAD OPERATOR (...) HERE
                // This flattens the errors so they don't become an array inside an array!
                validationErrors.push(...result.error.issues);
            }
        }

        // 3. Clean format output for your global handler
        if (validationErrors.length) {
            // Map the errors cleanly to match your custom error expectations
            const formattedErrors = validationErrors.map(err => ({
                field: err.path.map((segment: any) => String(segment)).join('.'),
                message: err.message
            }));

            // Pass the error to next() instead of throwing inside async middleware!
            return next(new BadRequestException('Validation error', formattedErrors));
        }
        
        next();
    };
};

export default validation;