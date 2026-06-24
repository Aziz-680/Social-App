import PostRepository from "../../DB/Repos/post.repo";
import { CreatePostBodyType } from "../../Common/Types/type.types"; 

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
}

export default new PostService();