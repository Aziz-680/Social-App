import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestException } from "../Common/Utils"; 

type RequestKey = keyof Request;
type SchemaType = Partial<Record<RequestKey, ZodType>>;

const validation = (schema: SchemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: any[] = [];
        
        for (const key in schema) {
            const validkey = key as RequestKey;
            const result = schema[validkey]?.safeParse(req[validkey]);

            if (result && !result.success) {
               
                validationErrors.push(...result.error.issues);
            }
        }

        if (validationErrors.length) {
            const formattedErrors = validationErrors.map(err => ({
                field: err.path.map((segment: any) => String(segment)).join('.'),
                message: err.message
            }));

            return next(new BadRequestException('Validation error', formattedErrors));
        }
        
        next();
    };
};

export default validation;