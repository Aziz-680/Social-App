import CommentRepository from "../../DB/Repos/comment.repo";
import { CreateCommentBodyType } from "../../Common/Types/type.types"; 

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
}

export default new CommentService();