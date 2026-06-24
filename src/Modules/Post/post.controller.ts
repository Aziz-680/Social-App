import { Router, Response, Request, NextFunction } from "express";
import postService from "./post.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CreatePostSchema, LikePostSchema } from "../../Validators/post.validators";

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

postController.put(
    '/:id/like',
    authenticate, // 1. Must be logged in
    validation(LikePostSchema), // 2. Ensure :id parameter is a valid MongoDB ID
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        
        // Normalize the postId param and pass the userId from the token
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await postService.toggleLike(postId, req.user._id);
        
        return { 
            message: "Post like toggled successfully", 
            data: result, 
            meta: { statusCode: 200 } 
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