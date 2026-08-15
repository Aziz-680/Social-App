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
    '/imgupld',
    authenticate, 

    upload.single('image'),
    
    validation(CreatePostSchema),
    responseFormatter (async (req: Request, res: Response, next: NextFunction) => {

        const postData = {
            content: req.body.content,
            media: req.file ? [req.file.path] : []
        };
        const _id = (req as ISecureRequest).user._id;
        const result = await postService.createPost(_id, postData);
        
        return { 
            message: "Post created successfully", 
            data: result, 
            meta: { statusCode: 201 } 
        };
    }),

);

postController.put(
    '/:id/like',
    authenticate, 
    validation(LikePostSchema), 
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
        
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
    authenticate, 
    validation(DeletePostSchema), 
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