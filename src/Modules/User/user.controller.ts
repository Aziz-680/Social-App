import { Router, Response, NextFunction, Request } from "express";
import userService from "./user.service";
import { responseFormatter } from "../../Middlewares";
import { authenticate, ISecureRequest } from "../../Middlewares/auth.middleware"; 

import validation from "../../Middlewares/validation.middleware";
import { UpdateUserSchema } from "../../Validators/user.validators";

import UserModel from '../../DB/Models/user.model'; 

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


export const sendFriendRequest = async (req: ISecureRequest, res: Response): Promise<any> => {
    try {
        const senderId = req.user._id; // The person clicking "Add Friend"
        const targetId = req.params.id; // The person receiving the request

        // 1. Guardrail: Prevent adding yourself
        if (senderId === targetId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend." });
        }

        const targetUser = await UserModel.findById(targetId);
        const senderUser = await UserModel.findById(senderId);

        if (!targetUser || !senderUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Guardrail: Check if they are already friends
        if (targetUser.friends.includes(senderId as any)) {
            return res.status(400).json({ message: "You are already friends." });
        }

        // 3. Guardrail: Check if a request is already pending
        if (targetUser.friendRequests.includes(senderId as any)) {
            return res.status(400).json({ message: "Friend request already sent." });
        }

        // 4. The Action: Update both arrays
        targetUser.friendRequests.push(senderId as any);
        senderUser.sentRequests.push(targetId as any);

        // Save both documents at the exact same time
        await Promise.all([targetUser.save(), senderUser.save()]);

        return res.status(200).json({ message: "Friend request sent successfully!" });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};

userController.post('/friend-request/:id', authenticate, sendFriendRequest);



export default userController;