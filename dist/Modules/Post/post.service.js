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
const post_repo_1 = __importDefault(require("../../DB/Repos/post.repo"));
const Utils_1 = require("../../Common/Utils");
class PostService {
    constructor(postRepository = new post_repo_1.default()) {
        this.postRepository = postRepository;
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
                    limit: limit
                }
            };
        });
        this.toggleLike = (postId, userId) => __awaiter(this, void 0, void 0, function* () {
            const updatedPost = yield this.postRepository.toggleLike(postId, userId);
            if (!updatedPost) {
                throw new Utils_1.NotFoundException("Post not found");
            }
            return updatedPost;
        });
        this.deletePost = (postId, userId) => __awaiter(this, void 0, void 0, function* () {
            // 1. Find the post in the database
            const post = yield this.postRepository.findDocumentById(postId);
            if (!post) {
                throw new Utils_1.NotFoundException("Post not found");
            }
            // 2. 🛡️ THE AUTHORIZATION CHECK 
            // We MUST convert the MongoDB ObjectId to a string before comparing it to the token's string ID!
            if (post.userId.toString() !== userId) {
                throw new Utils_1.ForbiddenException("You are not authorized to delete someone else's post");
            }
            // 3. If they pass the check, delete it!
            yield this.postRepository.deleteDocument(postId);
            return null;
        });
    }
}
exports.default = new PostService();
