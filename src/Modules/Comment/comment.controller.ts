import { Router, Response } from "express";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CreateCommentSchema } from "../../Validators/comment.valiators";
import postService from "../Post/post.service";

const commentController = Router();

// ==========================================
// 🛡️ PROTECTED ROUTE: ADD A COMMENT
// ==========================================
commentController.post(
    '/',
    authenticate, // You must be logged in to comment
    validation(CreateCommentSchema), // Checks the content & postId
    responseFormatter(async (req: ISecureRequest, res: Response) => {

        const result = await postService.addComment(
            req.body.postId,
            req.user._id.toString(),
            req.body.content
        );

        return {
            message: "Comment added successfully",
            data: result,
            meta: { statusCode: 201 }
        };
    })
);

// ==========================================
// 🛡️ PROTECTED ROUTE: GET COMMENTS FOR A POST
// ==========================================
commentController.get(
    '/:postId',
    authenticate,
    responseFormatter(async (req: ISecureRequest, res: Response) => {
        const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
        const result = await postService.getPostComments(postId, req.user._id.toString());

        return {
            message: "Comments fetched successfully",
            data: result,
            meta: { statusCode: 200 }
        };
    })
);

export default commentController;