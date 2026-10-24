import { Router, Response, Request, NextFunction } from "express";
import postService from "./post.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CommentSchema, ReactionSchema, RepostSchema, UploadPostSchema, EditPostSchema, DeletePostSchema, PostIdSchema } from "../../Validators/post.validators";
import { BadRequestException } from "../../Common/Utils/Errors/exceptions";
import { uploadPost } from "../../Middlewares/upload.middleware";

const postController = Router();

const parseParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

const parsePagination = (query: Request["query"], defaultLimit: number) => {
  const page = Number.parseInt(String(query.page), 10);
  const limit = Number.parseInt(String(query.limit), 10);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : defaultLimit
  };
};

// ==========================================
// 1. SPECIFIC / NAMED ROUTES (MUST BE FIRST)
// ==========================================

const feedHandler = responseFormatter(async (req: ISecureRequest, res: Response) => {
    const { page, limit } = parsePagination(req.query, 10);

    const result = await postService.getFeedPosts(req.user._id.toString(), page, limit);

    return {
      message: "Feed posts fetched successfully",
      data: result.posts,
      meta: { statusCode: 200, pagination: result.pagination }
    };
});

// Keep both paths supported for existing clients.
postController.get('/', authenticate, feedHandler);
postController.get('/feed', authenticate, feedHandler);

// GET: /api/post/user/:userId
postController.get(
  '/user/:userId',
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {
    const { page, limit } = parsePagination(req.query, 5);

    const userId = parseParamId(req.params.userId);

    if (!userId || userId === "undefined") {
      throw new BadRequestException("Invalid User ID");
    }

    const result = await postService.getUserPosts(userId, req.user._id.toString(), page, limit);
    
    return { 
      message: "User posts fetched successfully", 
      data: result.posts, 
      meta: { statusCode: 200, pagination: result.pagination } 
    };
  })
);

// POST: /api/post (Create Post)
postController.post(
  '/',
  authenticate,
  uploadPost.single('image'),
  validation(UploadPostSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postData = {
      content: req.body.content,
      media: [
        ...(Array.isArray(req.body.media) ? req.body.media : req.body.media ? [req.body.media] : []),
        ...(req.file ? [(req.file as Express.Multer.File).path] : [])
      ],
      privacy: req.body.privacy || 'public'
    };
    const result = await postService.createPost(req.user._id.toString(), postData);

    return {
      message: "Post created successfully",
      data: result,
      meta: { statusCode: 201 }
    };
  })
);

// ==========================================
// 2. PARAMETERIZED ROUTES (MUST BE LAST)
// ==========================================

// EDIT COMMENT
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

// DELETE COMMENT
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
    return { message: "Comment added successfully", data: result, meta: { statusCode: 201 } };
  })
);

// POST REACTION
postController.post(
  '/:id/like',
  authenticate,
  validation(PostIdSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.addReaction(postId, req.user._id.toString(), 'like');
    return { message: "Post like updated", data: result, meta: { statusCode: 200 } };
  })
);

postController.get(
  '/:id',
  authenticate,
  validation(PostIdSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await postService.getPost(
      parseParamId(req.params.id),
      req.user._id.toString()
    );
    return { message: "Post fetched successfully", data: result, meta: { statusCode: 200 } };
  })
);

postController.post(
  '/:id/react',
  authenticate,
  validation(ReactionSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.addReaction(postId, req.user._id.toString(), req.body.type);
    return { message: "Reaction updated", data: result, meta: { statusCode: 200 } };
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
    return { message: "Post shared to your profile", data: result, meta: { statusCode: 201 } };
  })
);

// EDIT POST
postController.put(
  '/:id',
  authenticate,
  validation(EditPostSchema),
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const postId = parseParamId(req.params.id);
    const result = await postService.updatePost(
      postId,
      req.user._id.toString(),
      req.body.content,
      req.body.privacy
    );

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
    return { message: "Post deleted successfully", data: null, meta: { statusCode: 200 } };
  })
);

export default postController;