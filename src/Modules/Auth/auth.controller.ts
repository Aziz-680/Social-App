import { Router, Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import { responseFormatter } from "../../Middlewares";

const authController = Router();

// Registration endpoint
authController.post('/register', responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    // Pass the entire request body to the service
    const result = await authService.registerUser(req.body);
    
    return { 
        message: "User registered successfully", 
        data: result, 
        meta: { statusCode: 201 } 
    };
}));

// Login endpoint
authController.post('/login', responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    // Pass the login credentials to the service
    const result = await authService.loginUser(req.body);
    
    return { 
        message: "User logged in successfully", 
        data: result, 
        meta: { statusCode: 200 } 
    };
}));

export default authController;