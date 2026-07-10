import { Router, Response, Request, NextFunction } from "express";
import postService from "./post.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CreatePostSchema, LikePostSchema , DeletePostSchema} from "../../Validators/post.validators";
import { upload } from "../../Middlewares/upload.middleware";

const postController = Router();

// ==========================================
// 🛡️ PROTECTED ROUTE: CREATE A POST
// ==========================================
postController.post(
    '/',
    authenticate, // 1. Guard checks the token and gets the User I

    upload.single('image'), //  1. Multer intercepts the file named 'image'
    
    // validation(CreatePostSchema), // (Optional: You may need to tweak Zod since 'media' is no longer in the JSON body)
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {

        // 🔰
        console.log("BODY DATA:", req.body);
        console.log("FILE DATA:", req.file);

        // 2. Build the post data. If they uploaded a file, use the Cloudinary URL!
        const postData = {
            content: req.body.content,
            media: req.file ? [req.file.path] : [] // req.file.path is the magical Cloudinary URL!
        };

        const result = await postService.createPost(req.user._id, postData);
        
        return { 
            message: "Post created successfully", 
            data: result, 
            meta: { statusCode: 201 } 
        };
    }),
    
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

postController.delete(
    '/:id',
    authenticate, // 1. Guard checks IF they are logged in
    validation(DeletePostSchema), // 2. Zod checks the ID format
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        
        // Normalize the postId param and pass the userId from the token to the service
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await postService.deletePost(postId, req.user._id);
        
        return { 
            message: "Post deleted successfully", 
            data: null, 
            meta: { statusCode: 200 } 
        };
    })
);

// ==========================================
// 🌍 PUBLIC ROUTE: GET ALL POSTS
// ==========================================
postController.get(
    '/',
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // 2. Pass them to the service
        const result = await postService.getAllPosts(page, limit);
        
        return { 
            message: "Timeline fetched successfully", 
            data: result.posts, 
            meta: { 
                statusCode: 200,
                pagination: result.pagination 
            } 
        };
    })
);

export default postController;