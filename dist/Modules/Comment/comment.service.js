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
const comment_repo_1 = __importDefault(require("../../DB/Repos/comment.repo"));
class CommentService {
    constructor(commentRepository = new comment_repo_1.default()) {
        this.commentRepository = commentRepository;
        // Create a new comment linked to both the User and the Post
        this.createComment = (userId, commentData) => __awaiter(this, void 0, void 0, function* () {
            const newCommentData = Object.assign(Object.assign({}, commentData), { userId });
            const comment = yield this.commentRepository.createDocument(newCommentData);
            return comment;
        });
        // Fetch all comments for a specific post
        this.getCommentsByPostId = (postId) => __awaiter(this, void 0, void 0, function* () {
            // Sort by oldest first so comments read naturally top-to-bottom
            const comments = yield this.commentRepository.findDocuments({ postId }, { sort: { createdAt: 1 } });
            return comments;
        });
    }
}
exports.default = new CommentService();
