import { Request, Response, NextFunction } from "express";
import TokenService from "../Common/Services/token.service"; 
import { UnauthorizedException } from "../Common/Utils/Errors/exceptions"; 

export interface ISecureRequest extends Request {
    user?: any;
    decodedData?: any;  
}

export const authenticate = async (req: ISecureRequest, res: Response, next: NextFunction) => {
    try {
        // 2. Extract the Authorization header
        const authHeader = req.headers.authorization;

        // 3. Check if the header exists and follows the "Bearer <token>" format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException("Access denied. No token provided.");
        }

        // 4. Split the string to get just the token part
        const token = authHeader.split(' ')[1];

        // 5. Decode and verify the token using your TokenService
        const decodedPayload = await TokenService.decodeToken({ token, tokenType: 'ACCESS' });

        // 6. Attach the decoded payload (which has the _id) to the request object
        req.user = decodedPayload.user;
        req.decodedData = decodedPayload.decodedData;

        next();
    } catch (error: any) {
        if (error instanceof UnauthorizedException) {
            return next(error);
        }
        
    
        next(new UnauthorizedException("Invalid or expired token"));
    }
};