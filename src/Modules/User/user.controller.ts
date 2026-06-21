import { Router, Response, NextFunction } from "express";
import userService from "./user.service";
import { responseFormatter } from "../../Middlewares";
import { authenticate, ISecureRequest } from "../../Middlewares/auth.middleware"; 

const userController = Router();

// GET: Fetch logged-in user's profile
userController.get(
    '/profile', 
    authenticate, // <-- The Guard goes right here!
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        
        // Because the Guard let them through, we safely have their ID in req.user!
                console.log(req.user);

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
    '/profile', // Changed from '/:id' to '/profile'
    authenticate, // 🛡️ The Guard intercepts the request here!
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        
        // Securely update the user matching the token
        const result = await userService.updateUserProfile(req.user._id, req.body);
        
        return { 
            message: "User profile updated successfully", 
            data: result, 
            meta: { statusCode: 200 } 
        };
    })
);

export default userController;