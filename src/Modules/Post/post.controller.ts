import { Router, Response, Request, NextFunction } from "express";
import postService from "./post.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CreatePostSchema } from "../../Validators/post.validators";

const postController = Router();

// ==========================================
// 🛡️ PROTECTED ROUTE: CREATE A POST
// ==========================================
postController.post(
    '/',
    authenticate, // 1. Guard checks the token and gets the User ID
    validation(CreatePostSchema), // 2. Zod checks the post content
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        
        // Pass the securely extracted user ID and the validated body to the service
        const result = await postService.createPost(req.user._id, req.body);
        
        return { 
            message: "Post created successfully", 
            data: result, 
            meta: { statusCode: 201 } 
        };
    })
);

// ==========================================
// 🌍 PUBLIC ROUTE: GET ALL POSTS
// ==========================================
postController.get(
    '/',
    // Notice: No authenticate guard here!
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        
        const result = await postService.getAllPosts();
        
        return { 
            message: "Timeline fetched successfully", 
            data: result, 
            meta: { statusCode: 200 } 
        };
    })
);

export default postController;