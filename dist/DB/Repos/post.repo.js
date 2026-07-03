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
    }
    // Toggle a like safely using MongoDB atomic operators
    toggleLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const post = yield post_model_1.default.findById(postId);
            if (!post)
                return null;
            // Check if the user's ID is already in the likes array
            const hasLiked = (_a = post.likes) === null || _a === void 0 ? void 0 : _a.includes(userId);
            if (hasLiked) {
                // UNLIKE: Remove the userId from the array
                return yield post_model_1.default.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true } // Returns the updated document
                );
            }
            else {
                // LIKE: Add the userId to the array safely
                return yield post_model_1.default.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });
            }
        });
    }
    findAllPostsWithUsers(skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield post_model_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'firstName lastName profilePicture');
            const total = yield post_model_1.default.countDocuments();
            return { data, total };
        });
    }
}
exports.default = PostRepository;
