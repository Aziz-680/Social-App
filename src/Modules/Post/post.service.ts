import PostRepository from "../../DB/Repos/post.repo";
import { CreatePostBodyType } from "../../Common/Types/type.types"; 
import { NotFoundException, ForbiddenException } from "../../Common/Utils";

class PostService {
    constructor(
        private postRepository: PostRepository = new PostRepository()
    ) {}

    createPost = async (userId: string, postData: CreatePostBodyType) => {
        const newPostData = {
            ...postData,
            userId 
        };

        const post = await this.postRepository.createDocument(newPostData);
        return post;
    };

    getAllPosts = async () => {
        const posts = await this.postRepository.findDocuments({}, { sort: { createdAt: -1 } });
        return posts;
    };

    toggleLike = async (postId: string, userId: string) => {
        const updatedPost = await this.postRepository.toggleLike(postId, userId);
        
        if (!updatedPost) {
            throw new NotFoundException("Post not found");
        }

        return updatedPost;
    };

    deletePost = async (postId: string, userId: string) => {
        // 1. Find the post in the database
        const post = await this.postRepository.findDocumentById(postId as any);

        if (!post) {
            throw new NotFoundException("Post not found");
        }

        // 2. 🛡️ THE AUTHORIZATION CHECK 
        // We MUST convert the MongoDB ObjectId to a string before comparing it to the token's string ID!
        if (post.userId.toString() !== userId) {
            throw new ForbiddenException("You are not authorized to delete someone else's post");
        }

        // 3. If they pass the check, delete it!
        await this.postRepository.deleteDocument(postId as any);

        return null;
    };
}

export default new PostService();