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
const mongoose_1 = require("mongoose");
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
            var _a, _b;
            if (!((_a = postData.content) === null || _a === void 0 ? void 0 : _a.trim()) && !((_b = postData.media) === null || _b === void 0 ? void 0 : _b.length)) {
                throw new Utils_1.BadRequestException("A post must include text or media");
            }
            const newPostData = Object.assign(Object.assign({}, postData), { userId });
            const post = yield this.postRepository.createDocument(newPostData);
            return post_model_1.default.findById(post._id)
                .populate("userId", "firstName lastName profilePicture");
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
        this.getUserPosts = (userId_1, viewerId_1, ...args_1) => __awaiter(this, [userId_1, viewerId_1, ...args_1], void 0, function* (userId, viewerId, page = 1, limit = 5) {
            if (!mongoose_1.Types.ObjectId.isValid(userId))
                throw new Utils_1.BadRequestException("Invalid user ID");
            const skip = (page - 1) * limit;
            const profile = yield user_model_1.default.findById(userId).select("friends");
            if (!profile)
                throw new Utils_1.NotFoundException("User not found");
            const isOwner = userId === viewerId;
            const isFriend = profile.friends.some((friendId) => friendId.toString() === viewerId);
            const privacyFilter = isOwner
                ? {}
                : { privacy: isFriend ? { $in: ["public", "friends"] } : "public" };
            const query = Object.assign({ userId }, privacyFilter);
            const [posts, total] = yield Promise.all([
                post_model_1.default.find(query)
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
                post_model_1.default.countDocuments(query)
            ]);
            return {
                posts,
                pagination: {
                    totalItems: total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit,
                },
            };
        });
        this.getPost = (postId, viewerId) => __awaiter(this, void 0, void 0, function* () {
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            yield this.assertCanViewPost(post, viewerId);
            yield post.populate("userId", "firstName lastName profilePicture");
            yield post.populate("likes", "firstName lastName profilePicture");
            yield post.populate("comments.userId", "firstName lastName profilePicture");
            yield post.populate({
                path: "originalPostId",
                populate: { path: "userId", select: "firstName lastName profilePicture" }
            });
            return post;
        });
        this.getPostComments = (postId, viewerId) => __awaiter(this, void 0, void 0, function* () {
            const post = yield this.getPost(postId, viewerId);
            return post.comments;
        });
        this.assertCanViewPost = (post, viewerId) => __awaiter(this, void 0, void 0, function* () {
            const authorId = post.userId.toString();
            if (authorId === viewerId || post.privacy === "public")
                return;
            if (post.privacy === "friends") {
                const author = yield user_model_1.default.findById(authorId).select("friends");
                if (author === null || author === void 0 ? void 0 : author.friends.some((friendId) => friendId.toString() === viewerId))
                    return;
            }
            throw new Utils_1.ForbiddenException("You are not authorized to view this post");
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
                    .populate("likes", "firstName lastName profilePicture")
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
        this.updatePost = (postId, userId, content, privacy) => __awaiter(this, void 0, void 0, function* () {
            const post = yield this.postRepository.findDocumentById(postId);
            if (!post) {
                throw new Utils_1.NotFoundException("Post not found");
            }
            if (post.userId.toString() !== userId.toString()) {
                throw new Utils_1.ForbiddenException("You are not authorized to edit this post");
            }
            const updatedPost = yield post_model_1.default.findByIdAndUpdate(postId, Object.assign(Object.assign({}, (content !== undefined && { content })), (privacy !== undefined && { privacy })), { new: true }).populate("userId", "firstName lastName profilePicture");
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
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                throw new Utils_1.NotFoundException("Post not found");
            yield this.assertCanViewPost(post, userId);
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
            yield this.assertCanViewPost(post, userId);
            const existingReactionIndex = post.reactions.findIndex((r) => r.userId.toString() === userId.toString());
            if (existingReactionIndex > -1) {
                if (post.reactions[existingReactionIndex].type === reactionType) {
                    post.reactions.splice(existingReactionIndex, 1);
                    post.likes.pull(userId);
                }
                else {
                    post.reactions[existingReactionIndex].type = reactionType;
                    post.likes.addToSet(userId);
                }
            }
            else {
                post.reactions.push({ userId: userId, type: reactionType });
                post.likes.addToSet(userId);
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
            yield this.assertCanViewPost(originalPost, userId);
            if (originalPost.privacy !== "public") {
                throw new Utils_1.ForbiddenException("Only public posts can be reposted");
            }
            const repost = yield post_model_1.default.create({
                userId,
                content: "",
                privacy: originalPost.privacy,
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
            yield this.assertCanViewPost(post, userId);
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
            yield this.assertCanViewPost(post, userId);
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
            yield this.assertCanViewPost(post, userId);
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
            yield this.assertCanViewPost(post, userId);
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
