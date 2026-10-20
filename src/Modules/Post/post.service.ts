import { Types } from "mongoose";
import PostModel from "../../DB/Models/post.model";
import UserModel from "../../DB/Models/user.model";
import PostRepository from "../../DB/Repos/post.repo";
import { CreatePostBodyType } from "../../Common/Types/type.types";
import { NotFoundException, ForbiddenException, BadRequestException } from "../../Common/Utils";

class PostService {
  constructor(private postRepository: PostRepository = new PostRepository()) {}

  // ==========================================
  // 📝 POST CREATION & READ METHODS
  // ==========================================
  createPost = async (userId: string, postData: CreatePostBodyType) => {
    if (!postData.content?.trim() && !postData.media?.length) {
      throw new BadRequestException("A post must include text or media");
    }
    const newPostData = {
      ...postData,
      userId,
    };

    const post = await this.postRepository.createDocument(newPostData);
    return PostModel.findById(post._id)
      .populate("userId", "firstName lastName profilePicture");
  };

  getAllPosts = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const { data, total } = await this.postRepository.findAllPostsWithUsers(
      skip,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return {
      posts: data,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
      },
    };
  };

  getUserPosts = async (userId: string, viewerId: string, page: number = 1, limit: number = 5) => {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException("Invalid user ID");
    const skip = (page - 1) * limit;
    const profile = await UserModel.findById(userId).select("friends");
    if (!profile) throw new NotFoundException("User not found");

    const isOwner = userId === viewerId;
    const isFriend = profile.friends.some((friendId: Types.ObjectId) => friendId.toString() === viewerId);
    const privacyFilter = isOwner
      ? {}
      : { privacy: isFriend ? { $in: ["public", "friends"] } : "public" };
    const query = { userId, ...privacyFilter };

    const [posts, total] = await Promise.all([
      PostModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName profilePicture")
        .populate("likes", "firstName lastName profilePicture")
        .populate("comments.userId", "firstName lastName profilePicture")
        .populate({
          path: "originalPostId",
          populate: { path: "userId", select: "firstName lastName profilePicture" }
        }),
      PostModel.countDocuments(query)
    ]);

    return {
      posts,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  };

  getPost = async (postId: string, viewerId: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, viewerId);
    await post.populate("userId", "firstName lastName profilePicture");
    await post.populate("likes", "firstName lastName profilePicture");
    await post.populate("comments.userId", "firstName lastName profilePicture");
    await post.populate({
      path: "originalPostId",
      populate: { path: "userId", select: "firstName lastName profilePicture" }
    });
    return post;
  };

  getPostComments = async (postId: string, viewerId: string) => {
    const post = await this.getPost(postId, viewerId);
    return post.comments;
  };

  private assertCanViewPost = async (
    post: { userId: { toString(): string }; privacy?: string },
    viewerId: string
  ) => {
    const authorId = post.userId.toString();
    if (authorId === viewerId || post.privacy === "public") return;
    if (post.privacy === "friends") {
      const author = await UserModel.findById(authorId).select("friends");
      if (author?.friends.some((friendId: Types.ObjectId) => friendId.toString() === viewerId)) return;
    }
    throw new ForbiddenException("You are not authorized to view this post");
  };

  // Fetch Timeline: Public posts, own posts, or posts from friends with 'public' or 'friends' privacy
  getFeedPosts = async (currentUserId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const currentUser = await UserModel.findById(currentUserId);
    const friendIds = currentUser?.friends || [];

    const feedQuery = {
      $or: [
        { privacy: 'public' },
        { userId: currentUserId },
        { 
          userId: { $in: friendIds }, 
          privacy: { $in: ['public', 'friends'] } 
        }
      ]
    };

    const [posts, total] = await Promise.all([
      PostModel.find(feedQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName profilePicture")
        .populate("likes", "firstName lastName profilePicture")
        .populate("comments.userId", "firstName lastName profilePicture")
        .populate({
          path: "originalPostId",
          populate: { path: "userId", select: "firstName lastName profilePicture" }
        }),
      PostModel.countDocuments(feedQuery)
    ]);

    return {
      posts,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  };

  // ==========================================
  // ✏️ POST UPDATE & DELETE METHODS
  // ==========================================
  updatePost = async (postId: string, userId: string, content?: string, privacy?: string) => {
    const post = await this.postRepository.findDocumentById(postId as any);
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.userId.toString() !== userId.toString()) {
      throw new ForbiddenException("You are not authorized to edit this post");
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { ...(content !== undefined && { content }), ...(privacy !== undefined && { privacy }) },
      { new: true }
    ).populate("userId", "firstName lastName profilePicture");

    return updatedPost;
  };

  deletePost = async (postId: string, userId: string) => {
    const post = await this.postRepository.findDocumentById(postId as any);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.userId.toString() !== userId.toString()) {
      throw new ForbiddenException(
        "You are not authorized to delete someone else's post"
      );
    }

    await this.postRepository.deleteDocument(postId as any);
    return null;
  };

  // ==========================================
  // 👍 POST REACTIONS & REPOSTS
  // ==========================================
  toggleLike = async (postId: string, userId: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, userId);
    const updatedPost = await this.postRepository.toggleLike(postId, userId);

    if (!updatedPost) {
      throw new NotFoundException("Post not found");
    }

    return updatedPost;
  };

  addReaction = async (postId: string, userId: string, reactionType: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, userId);

    const existingReactionIndex = post.reactions.findIndex(
      (r: any) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (post.reactions[existingReactionIndex].type === reactionType) {
        post.reactions.splice(existingReactionIndex, 1);
        post.likes.pull(userId as any);
      } else {
        post.reactions[existingReactionIndex].type = reactionType as any;
        post.likes.addToSet(userId as any);
      }
    } else {
      post.reactions.push({ userId: userId as any, type: reactionType as any });
      post.likes.addToSet(userId as any);
    }

    await post.save();
    return PostModel.findById(postId)
      .populate("userId", "firstName lastName profilePicture")
      .populate("comments.userId", "firstName lastName profilePicture");
  };

  repost = async (postId: string, userId: string) => {
    const originalPost = await PostModel.findById(postId);
    if (!originalPost) throw new NotFoundException("Original post not found");
    await this.assertCanViewPost(originalPost, userId);
    if (originalPost.privacy !== "public") {
      throw new ForbiddenException("Only public posts can be reposted");
    }

    const repost = await PostModel.create({
      userId,
      content: "",
      privacy: originalPost.privacy,
      isRepost: true,
      originalPostId: originalPost._id
    });

    return repost.populate("userId", "firstName lastName profilePicture");
  };

  // ==========================================
  // 💬 COMMENT OPERATIONS (MANAGEMENT & REACTIONS)
  // ==========================================
  addComment = async (postId: string, userId: string, content: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, userId);

    post.comments.push({ userId: userId as any, content, createdAt: new Date() } as any);
    await post.save();

    return PostModel.findById(postId)
      .populate("userId", "firstName lastName profilePicture")
      .populate("comments.userId", "firstName lastName profilePicture");
  };

  updateComment = async (postId: string, commentId: string, userId: string, content: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, userId);

    const comment = post.comments.id(commentId) as any;
    if (!comment) throw new NotFoundException("Comment not found");

    // Authorization: Only the comment owner can edit
    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenException("Only the author can edit this comment");
    }

    comment.content = content;
    await post.save();

    return PostModel.findById(postId)
      .populate("userId", "firstName lastName profilePicture")
      .populate("comments.userId", "firstName lastName profilePicture");
  };

  deleteComment = async (postId: string, commentId: string, userId: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, userId);

    const comment = post.comments.id(commentId) as any;
    if (!comment) throw new NotFoundException("Comment not found");

    const isCommentOwner = comment.userId.toString() === userId.toString();
    const isPostOwner = post.userId.toString() === userId.toString();

    // Authorization: Either the comment owner OR the post owner can delete
    if (!isCommentOwner && !isPostOwner) {
      throw new ForbiddenException("You are not authorized to delete this comment");
    }

    post.comments.pull(commentId);
    await post.save();

    return PostModel.findById(postId)
      .populate("userId", "firstName lastName profilePicture")
      .populate("comments.userId", "firstName lastName profilePicture");
  };

  reactToComment = async (postId: string, commentId: string, userId: string, reactionType: string) => {
    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    await this.assertCanViewPost(post, userId);

    const comment = post.comments.id(commentId) as any;
    if (!comment) throw new NotFoundException("Comment not found");

    if (!comment.reactions) comment.reactions = [];

    const existingIndex = comment.reactions.findIndex(
      (r: any) => r.userId.toString() === userId.toString()
    );

    if (existingIndex > -1) {
      if (comment.reactions[existingIndex].type === reactionType) {
        comment.reactions.splice(existingIndex, 1);
      } else {
        comment.reactions[existingIndex].type = reactionType;
      }
    } else {
      comment.reactions.push({ userId, type: reactionType });
    }

    await post.save();

    return PostModel.findById(postId)
      .populate("userId", "firstName lastName profilePicture")
      .populate("comments.userId", "firstName lastName profilePicture");
  };
}

export default new PostService();