import PostRepository from "../../DB/Repos/post.repo";
import { CreatePostBodyType } from "../../Common/Types/type.types"; 
import { NotFoundException } from "../../Common/Utils";

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
}

export default new PostService();