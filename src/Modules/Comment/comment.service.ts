import CommentRepository from "../../DB/Repos/comment.repo";
import { CreateCommentBodyType } from "../../Common/Types/type.types"; 
import { ForbiddenException, NotFoundException } from "../../Common/Utils/Errors/exceptions";

class CommentService {
    constructor(
        private commentRepository: CommentRepository = new CommentRepository()
    ) {}

    // Create a new comment linked to both the User and the Post
    createComment = async (userId: string, commentData: CreateCommentBodyType) => {
        const newCommentData = {
            ...commentData,
            userId 
        };

        const comment = await this.commentRepository.createDocument(newCommentData);
        return comment;
    };

    // Fetch all comments for a specific post
    getCommentsByPostId = async (postId: string) => {
        // Sort by oldest first so comments read naturally top-to-bottom
        const comments = await this.commentRepository.findDocuments({ postId }, { sort: { createdAt: 1 } });
        return comments;
    };

    // Inside comment.service.ts
    deleteComment = async (commentId: string, userId: string) => {
        const comment = await this.commentRepository.findDocumentById(commentId as any);

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        // 🛡️ The exact same Authorization check!
        if (comment.userId.toString() !== userId) {
            throw new ForbiddenException("You are not authorized to delete someone else's comment");
        }

        await this.commentRepository.deleteDocument(commentId as any);
        return null;
    };
}

export default new CommentService();