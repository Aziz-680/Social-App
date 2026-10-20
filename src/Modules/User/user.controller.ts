import { Router, Response, NextFunction, Request } from "express";
import userService from "./user.service";
import { responseFormatter } from "../../Middlewares";
import { authenticate, ISecureRequest } from "../../Middlewares/auth.middleware"; 
import { uploadProfile } from "../../Middlewares/upload.middleware";
import validation from "../../Middlewares/validation.middleware";
import { SearchUsersSchema, UpdateUserSchema } from "../../Validators/user.validators";

import UserModel from '../../DB/Models/user.model'; 

const userController = Router();

userController.get(
    '/search',
    authenticate,
    validation(SearchUsersSchema),
    responseFormatter(async (req: ISecureRequest, res: Response) => {
        const q = String(req.query.q);
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const result = await userService.searchUsers(q, req.user._id.toString(), page, limit);
        return {
            message: "Users fetched successfully",
            data: result.users,
            meta: { statusCode: 200, pagination: result.pagination }
        };
    })
);

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

userController.get(
    '/:userId',
    authenticate,
    responseFormatter(async (req: Request, res: Response) => {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const result = await userService.getPublicProfile(userId);
        return {
            message: "User profile fetched successfully",
            data: result,
            meta: { statusCode: 200 }
        };
    })
);

userController.post(
    '/upload-avatar',
    authenticate,
    uploadProfile.single('profilePicture'), 
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        if (!req.file) {
            throw new Error("No image file provided.");
        }

        const imageUrl = req.file.path;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id, 
            { profilePicture: imageUrl }, 
            { new: true }
        ).select('-password');

        return { 
            message: "Profile picture updated successfully via Cloudinary", 
            data: updatedUser, 
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