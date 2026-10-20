import { IPost } from "../../Common/Types/interface.types";
import PostModel from "../Models/post.model";
import BaseRepository from "./base.repo";

class PostRepository extends BaseRepository<IPost> {
  constructor() {
    super(PostModel);
  }

  // 1. Explicitly override base methods to avoid missing abstract implementation errors
  override findDocumentById = async (id: string | any): Promise<IPost | null> => {
    return await PostModel.findById(id).exec();
  };

  override deleteDocument = async (id: string | any): Promise<IPost | null> => {
    return await PostModel.findByIdAndDelete(id).exec();
  };

  // 2. Fetch all posts populated with author details and comment metadata
  findAllPostsWithUsers = async (skip: number, limit: number) => {
    const [data, total] = await Promise.all([
      PostModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName profilePicture")
        .populate("comments.userId", "firstName lastName profilePicture")
        .exec(),
      PostModel.countDocuments().exec(),
    ]);

    return { data, total };
  };

  // 3. Fetch specific user posts with population
  findPostsByUserId = async (userId: string, skip: number, limit: number) => {
    const [posts, total] = await Promise.all([
      PostModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName profilePicture")
        .populate("comments.userId", "firstName lastName profilePicture")
        .exec(),
      PostModel.countDocuments({ userId }).exec(),
    ]);

    return { posts, total };
  };

  // 4. Atomic like toggle using MongoDB $pull and $addToSet
  async toggleLike(postId: string, userId: string): Promise<IPost | null> {
    const post = await PostModel.findById(postId).exec();
    if (!post) return null;

    const hasLiked = post.likes?.some(
      (id: any) => id.toString() === userId.toString()
    );

    const updateQuery = hasLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    return await PostModel.findByIdAndUpdate(postId, updateQuery, { new: true })
      .populate("userId", "firstName lastName profilePicture")
      .exec();
  }
}

export default PostRepository;