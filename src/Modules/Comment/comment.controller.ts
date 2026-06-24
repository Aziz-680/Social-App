import { Router, Response, Request, NextFunction } from "express";
import commentService from "./comment.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import validation from "../../Middlewares/validation.middleware";
import { CreateCommentSchema } from "../../Validators/comment.valiators";

const commentController = Router();

// ==========================================
// 🛡️ PROTECTED ROUTE: ADD A COMMENT
// ==========================================
commentController.post(
    '/',
    authenticate, // You must be logged in to comment
    validation(CreateCommentSchema), // Checks the content & postId
    responseFormatter(async (req: ISecureRequest, res: Response, next: NextFunction) => {

        const result = await commentService.createComment(req.user._id, req.body);

        return {
            message: "Comment added successfully",
            data: result,
            meta: { statusCode: 201 }
        };
    })
);

// ==========================================
// 🌍 PUBLIC ROUTE: GET COMMENTS FOR A POST
// ==========================================
commentController.get(
    '/:postId',
    // No guard here! Anyone can read comments.
    responseFormatter(async (req: Request<{ postId: string }>, res: Response, next: NextFunction) => {

        // Grab the postId from the URL parameters
        const result = await commentService.getCommentsByPostId(req.params.postId);

        return {
            message: "Comments fetched successfully",
            data: result,
            meta: { statusCode: 200 }
        };
    })
);

export default commentController;