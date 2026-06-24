import { Router, Response, NextFunction } from "express";
import userService from "./user.service";
import { responseFormatter } from "../../Middlewares";
import { authenticate, ISecureRequest } from "../../Middlewares/auth.middleware"; 

import validation from "../../Middlewares/validation.middleware";
import { UpdateUserSchema } from "../../Validators/user.validators";

const userController = Router();

// GET: Fetch logged-in user's profile
userController.get(
    '/profile', 
    authenticate, 
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        const result = await userService.getUserProfile(req.user._id);
        return { 
            message: "Profile fetched successfully", 
            data: result, 
            meta: { statusCode: 200 } 
        };
    })
);

// PUT: Update logged-in user's profile
userController.put(
    '/profile', 
    authenticate, // 1. Check token
    validation(UpdateUserSchema), // 2. Check data shape
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        const result = await userService.updateUserProfile(req.user._id, req.body);
        return { 
            message: "User profile updated successfully", 
            data: result, 
            meta: { statusCode: 200 } 
        };
    })
);

export default userController;