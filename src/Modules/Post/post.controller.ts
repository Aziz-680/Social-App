import { Router, Response, Request, NextFunction } from "express";
import postService from "./post.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CommentSchema, ReactionSchema, RepostSchema, CreatePostSchema, EditPostSchema, DeletePostSchema } from "../../Validators/post.validators";
import { BadRequestException } from "../../Common/Utils/Errors/exceptions";
import { uploadPost } from "../../Middlewares/upload.middleware";

const postController = Router();

// Helper function to safely extract single string ID from Express params
const parseParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// ==========================================
// 🌍 GET FEED (Public/Friends Privacy Filtered)
// ==========================================
postController.get(
  '/',
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await postService.getFeedPosts(req.user._id.toString(), page, limit);

    return {
      message: "Feed posts fetched successfully",
      data: result.posts,
      meta: { statusCode: 200, pagination: result.pagination }
    };
  })
);

// ==========================================
// 👤 FETCH USER POSTS
// ==========================================
postController.get(
  '/user/:userId',
  authenticate,
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const userId = parseParamId(req.params.userId);

    if (!userId || userId === "undefined") {
      throw new BadRequestException("Invalid User ID");
    }

    const result = await postService.getUserPosts(userId, page, limit);
    
    return { 
      message: "User posts fetched successfully", 
      data: result.posts, 
      meta: { statusCode: 200, pagination: result.pagination } 
    };
  })
);

// ==========================================
// 📝 CREATE A POST (IMAGE UPLOAD)
// ==========================================
postController.post(
  '/imgupld', 
  authenticate, 
  uploadPost.single('image'),
  validation(CreatePostSchema),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const postData = {
      content: req.body.content,
      media: req.file ? [(req.file as any).path] : [],
      privacy: req.body.privacy || 'public'
    };
    const _id = (req as ISecureRequest).user._id.toString();
    
    const result = await postService.createPost(_id, postData as any);
    
    return { 
      message: "Post created successfully", 
      data: result, 
      meta: { statusCode: 201 } 
    };
  })
);

// ==========================================
// 💬 COMMENT OPERATIONS (nested under /:id)
// ==========================================

// EDIT COMMENT (Comment Author Only)
postController.put(
  '/:id/comment/:commentId',
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const commentId = parseParamId(req.params.commentId);
    
    const result = await postService.updateComment(postId, commentId, req.user._id.toString(), req.body.content);

    return { message: "Comment updated", data: result, meta: { statusCode: 200 } };
  })
);

// DELETE COMMENT (Post Owner OR Comment Author)
postController.delete(
  '/:id/comment/:commentId',
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const commentId = parseParamId(req.params.commentId);
    
    const result = await postService.deleteComment(postId, commentId, req.user._id.toString());

    return { message: "Comment deleted", data: result, meta: { statusCode: 200 } };
  })
);

// REACT TO COMMENT
postController.post(
  '/:id/comment/:commentId/react',
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const commentId = parseParamId(req.params.commentId);
    
    const result = await postService.reactToComment(postId, commentId, req.user._id.toString(), req.body.type);

    return { message: "Comment reaction updated", data: result, meta: { statusCode: 200 } };
  })
);

// ADD COMMENT
postController.post(
  '/:id/comment',
  authenticate,
  validation(CommentSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.addComment(postId, req.user._id.toString(), req.body.content);

    return {
      message: "Comment added successfully",
      data: result,
      meta: { statusCode: 201 }
    };
  })
);

// ==========================================
// 👍 POST ACTIONS (REACTION, REPOST, EDIT, DELETE)
// ==========================================

// POST REACTION
postController.post(
  '/:id/react',
  authenticate,
  validation(ReactionSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.addReaction(postId, req.user._id.toString(), req.body.type);

    return {
      message: "Reaction updated",
      data: result,
      meta: { statusCode: 200 }
    };
  })
);

// REPOST TO PROFILE
postController.post(
  '/:id/repost',
  authenticate,
  validation(RepostSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.repost(postId, req.user._id.toString());

    return {
      message: "Post shared to your profile",
      data: result,
      meta: { statusCode: 201 }
    };
  })
);

// EDIT POST
postController.put(
  '/:id',
  authenticate,
  validation(EditPostSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.updatePost(postId, req.user._id.toString(), req.body.content);

    return {
      message: "Post updated successfully",
      data: result,
      meta: { statusCode: 200 }
    };
  })
);

// DELETE POST
postController.delete(
  '/:id',
  authenticate,
  validation(DeletePostSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    await postService.deletePost(postId, req.user._id.toString());

    return {
      message: "Post deleted successfully",
      data: null,
      meta: { statusCode: 200 }
    };
  })
);

export default postController;