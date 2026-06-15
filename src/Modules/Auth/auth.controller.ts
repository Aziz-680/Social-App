import { Router, Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import { responseFormatter } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware"; // Your instructor's middleware
import { RegisterSchema, LoginSchema } from "../../Validators/auth.validators";

const authController = Router();

// Registration endpoint
authController.post(
    '/register', 
    validation(RegisterSchema), // Passed directly!
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const result = await authService.registerUser(req.body);
        
        return { 
            message: "User registered successfully", 
            data: result, 
            meta: { statusCode: 201 } 
        };
    })
);

// Login endpoint
authController.post(
    '/login', 
    validation(LoginSchema), 
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const result = await authService.loginUser(req.body);
        
        return { 
            message: "User logged in successfully", 
            data: result, 
            meta: { statusCode: 200 } 
        };
    })
);

export default authController;