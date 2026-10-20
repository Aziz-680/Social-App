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
const post_model_1 = __importDefault(require("../Models/post.model"));
const base_repo_1 = __importDefault(require("./base.repo"));
class PostRepository extends base_repo_1.default {
    constructor() {
        super(post_model_1.default);
        // 1. Explicitly override base methods to avoid missing abstract implementation errors
        this.findDocumentById = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield post_model_1.default.findById(id).exec();
        });
        this.deleteDocument = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield post_model_1.default.findByIdAndDelete(id).exec();
        });
        // 2. Fetch all posts populated with author details and comment metadata
        this.findAllPostsWithUsers = (skip, limit) => __awaiter(this, void 0, void 0, function* () {
            const [data, total] = yield Promise.all([
                post_model_1.default.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("userId", "firstName lastName profilePicture")
                    .populate("comments.userId", "firstName lastName profilePicture")
                    .exec(),
                post_model_1.default.countDocuments().exec(),
            ]);
            return { data, total };
        });
        // 3. Fetch specific user posts with population
        this.findPostsByUserId = (userId, skip, limit) => __awaiter(this, void 0, void 0, function* () {
            const [posts, total] = yield Promise.all([
                post_model_1.default.find({ userId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("userId", "firstName lastName profilePicture")
                    .populate("comments.userId", "firstName lastName profilePicture")
                    .exec(),
                post_model_1.default.countDocuments({ userId }).exec(),
            ]);
            return { posts, total };
        });
    }
    // 4. Atomic like toggle using MongoDB $pull and $addToSet
    toggleLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const post = yield post_model_1.default.findById(postId).exec();
            if (!post)
                return null;
            const hasLiked = (_a = post.likes) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === userId.toString());
            const updateQuery = hasLiked
                ? { $pull: { likes: userId } }
                : { $addToSet: { likes: userId } };
            return yield post_model_1.default.findByIdAndUpdate(postId, updateQuery, { new: true })
                .populate("userId", "firstName lastName profilePicture")
                .exec();
        });
    }
}
exports.default = PostRepository;
