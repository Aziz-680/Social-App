import { IPost } from "../../Common/Types/interface.types";
import PostModel from "../Models/post.model";
import BaseRepository from "./base.repo";

class PostRepository extends BaseRepository<IPost> {
    constructor() {
        super(PostModel);
    }

    // Toggle a like safely using MongoDB atomic operators
    async toggleLike(postId: string, userId: string) {
        const post = await PostModel.findById(postId);
        if (!post) return null;

        // Check if the user's ID is already in the likes array
        const hasLiked = post.likes?.includes(userId as any);

        if (hasLiked) {
            // UNLIKE: Remove the userId from the array
            return await PostModel.findByIdAndUpdate(
                postId, 
                { $pull: { likes: userId } }, 
                { new: true } // Returns the updated document
            );
        } else {
            // LIKE: Add the userId to the array safely
            return await PostModel.findByIdAndUpdate(
                postId, 
                { $addToSet: { likes: userId } }, 
                { new: true }
            );
        }
    }
}

export default PostRepository;