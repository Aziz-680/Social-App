"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = __importDefault(require("../../DB/Models/post.model"));
const user_model_1 = __importDefault(require("../../DB/Models/user.model"));
const post_repo_1 = __importDefault(require("../../DB/Repos/post.repo"));
const Utils_1 = require("../../Common/Utils");
class PostService {
    constructor(postRepository = new post_repo_1.default()) {
        this.postRepository = postRepository;
        // ==========================================
        // 📝 POST CREATION & READ METHODS
        // ==========================================
        this.createPost = (userId, postData) => __awaiter(this, void 0, void 0, function* () {
            const newPostData = Object.assign(Object.assign({}, postData), { userId });
            const post = yield this.postRepository.createDocument(newPostData);
            return post;
        });
        this.getAllPosts = (...args_1) => __awaiter(this, [...args_1], void 0, function* (page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const { data, total } = yield this.postRepository.findAllPostsWithUsers(skip, limit);
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
        });
        this.getUserPosts = (userId_1, ...args_1) => __awaiter(this, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 5) {
            const skip = (page - 1) * limit;
            const [posts, total] = yield Promise.all([
                post_model_1.default.find({ userId })
                    .populate("userId", "firstName lastName profilePicture")
                    .populate("comments.userId", "firstName lastName profilePicture")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                post_model_1.default.countDocuments({ userId }).exec(),
            ]);
            return {
                posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
        // Fetch Timeline: Public posts, own posts, or posts from friends with 'public' or 'friends' privacy
        this.getFeedPosts = (currentUserId_1, ...args_1) => __awaiter(this, [currentUserId_1, ...args_1], void 0, function* (currentUserId, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const currentUser = yield user_model_1.default.findById(currentUserId);
            const friendIds = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.friends) || [];
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
            const [posts, total] = yield Promise.all([
                post_model_1.default.find(feedQuery)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("userId", "firstName lastName profilePicture")
                    .populate("comments.userId", "firstName lastName profilePicture")
                    .populate({
                    path: "originalPostId",
                    populate: { path: "userId", select: "firstName lastName profilePicture" }
                }),
                post_model_1.default.countDocuments(feedQuery)
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
        });
        // ==========================================
        // ✏️ POST UPDATE & DELETE METHODS
        // ==========================================
        this.updatePost = (postId, userId, content) => __awaiter(this, void 0, void 0, function* () {
            const post = yield this.postRepository.findDocumentById(postId);
            if (!post) {
                throw new Utils_1.NotFoundException("Post not found");
            }
            if (post.userId.toString() !== userId.toString()) {
                throw new Utils_1.ForbiddenException("You are not authorized to edit this post");
            }
            const updatedPost = yield post_model_1.default.findByIdAndUpdate(postId, { content }, { new: true }).populate("userId", "firstName lastName profilePicture");
            return updatedPost;
        });
        this.deletePost = (postId, userId) => __awaiter(this, void 0, void 0, function* () {
            const post = yield this.postRepository.findDocumentById(postId);
            if (!post) {
                throw new Utils_1.NotFoundException("Post not found");
            }
            if (post.userId.toString() !== userId.toString()) {
                throw new Utils_1.ForbiddenException("You are not authorized to delete someone else's post");
            }
            yield this.postRepository.deleteDocument(postId);
            return null;
        });
        // ==========================================
        // 👍 POST REACTIONS & REPOSTS
        // ==========================================
        this.toggleLike = (postId, userId) => __awaiter(this, void 0, void 0, function* () {
            const updatedPost = yield this.postRepository.toggleLike(postId, userId);
            if (!updatedPost) {
                throw new Utils_1.NotFoundException("Post not found");
            }
            return updatedPost;
        });
        this.addReaction = (postId, userId, reactionType) => __awaiter(this, void 0, void 0, function* () {
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            const existingReactionIndex = post.reactions.findIndex((r) => r.userId.toString() === userId.toString());
            if (existingReactionIndex > -1) {
                if (post.reactions[existingReactionIndex].type === reactionType) {
                    post.reactions.splice(existingReactionIndex, 1);
                }
                else {
                    post.reactions[existingReactionIndex].type = reactionType;
                }
            }
            else {
                post.reactions.push({ userId: userId, type: reactionType });
            }
            yield post.save();
            return post_model_1.default.findById(postId)
                .populate("userId", "firstName lastName profilePicture")
                .populate("comments.userId", "firstName lastName profilePicture");
        });
        this.repost = (postId, userId) => __awaiter(this, void 0, void 0, function* () {
            const originalPost = yield post_model_1.default.findById(postId);
            if (!originalPost)
                throw new Utils_1.NotFoundException("Original post not found");
            if (originalPost.privacy === 'only_me' && originalPost.userId.toString() !== userId) {
                throw new Utils_1.ForbiddenException("Cannot repost private content");
            }
            const repost = yield post_model_1.default.create({
                userId,
                content: "",
                privacy: "public",
                isRepost: true,
                originalPostId: originalPost._id
            });
            return repost.populate("userId", "firstName lastName profilePicture");
        });
        // ==========================================
        // 💬 COMMENT OPERATIONS (MANAGEMENT & REACTIONS)
        // ==========================================
        this.addComment = (postId, userId, content) => __awaiter(this, void 0, void 0, function* () {
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            post.comments.push({ userId: userId, content, createdAt: new Date() });
            yield post.save();
            return post_model_1.default.findById(postId)
                .populate("userId", "firstName lastName profilePicture")
                .populate("comments.userId", "firstName lastName profilePicture");
        });
        this.updateComment = (postId, commentId, userId, content) => __awaiter(this, void 0, void 0, function* () {
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            const comment = post.comments.id(commentId);
            if (!comment)
                throw new Utils_1.NotFoundException("Comment not found");
            // Authorization: Only the comment owner can edit
            if (comment.userId.toString() !== userId.toString()) {
                throw new Utils_1.ForbiddenException("Only the author can edit this comment");
            }
            comment.content = content;
            yield post.save();
            return post_model_1.default.findById(postId)
                .populate("userId", "firstName lastName profilePicture")
                .populate("comments.userId", "firstName lastName profilePicture");
        });
        this.deleteComment = (postId, commentId, userId) => __awaiter(this, void 0, void 0, function* () {
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            const comment = post.comments.id(commentId);
            if (!comment)
                throw new Utils_1.NotFoundException("Comment not found");
            const isCommentOwner = comment.userId.toString() === userId.toString();
            const isPostOwner = post.userId.toString() === userId.toString();
            // Authorization: Either the comment owner OR the post owner can delete
            if (!isCommentOwner && !isPostOwner) {
                throw new Utils_1.ForbiddenException("You are not authorized to delete this comment");
            }
            post.comments.pull(commentId);
            yield post.save();
            return post_model_1.default.findById(postId)
                .populate("userId", "firstName lastName profilePicture")
                .populate("comments.userId", "firstName lastName profilePicture");
        });
        this.reactToComment = (postId, commentId, userId, reactionType) => __awaiter(this, void 0, void 0, function* () {
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            const comment = post.comments.id(commentId);
            if (!comment)
                throw new Utils_1.NotFoundException("Comment not found");
            if (!comment.reactions)
                comment.reactions = [];
            const existingIndex = comment.reactions.findIndex((r) => r.userId.toString() === userId.toString());
            if (existingIndex > -1) {
                if (comment.reactions[existingIndex].type === reactionType) {
                    comment.reactions.splice(existingIndex, 1);
                }
                else {
                    comment.reactions[existingIndex].type = reactionType;
                }
            }
            else {
                comment.reactions.push({ userId, type: reactionType });
            }
            yield post.save();
            return post_model_1.default.findById(postId)
                .populate("userId", "firstName lastName profilePicture")
                .populate("comments.userId", "firstName lastName profilePicture");
        });
    }
}
exports.default = new PostService();
