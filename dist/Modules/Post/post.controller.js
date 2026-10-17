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
const express_1 = require("express");
const post_service_1 = __importDefault(require("./post.service"));
const Middlewares_1 = require("../../Middlewares");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware"));
const post_validators_1 = require("../../Validators/post.validators");
const exceptions_1 = require("../../Common/Utils/Errors/exceptions");
const upload_middleware_1 = require("../../Middlewares/upload.middleware");
const postController = (0, express_1.Router)();
// Helper function to safely extract single string ID from Express params
const parseParamId = (param) => {
    return Array.isArray(param) ? param[0] : param;
};
// ==========================================
// 🌍 GET FEED (Public/Friends Privacy Filtered)
// ==========================================
postController.get('/', Middlewares_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = yield post_service_1.default.getFeedPosts(req.user._id.toString(), page, limit);
    return {
        message: "Feed posts fetched successfully",
        data: result.posts,
        meta: { statusCode: 200, pagination: result.pagination }
    };
})));
// ==========================================
// 👤 FETCH USER POSTS
// ==========================================
postController.get('/user/:userId', Middlewares_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const userId = parseParamId(req.params.userId);
    if (!userId || userId === "undefined") {
        throw new exceptions_1.BadRequestException("Invalid User ID");
    }
    const result = yield post_service_1.default.getUserPosts(userId, page, limit);
    return {
        message: "User posts fetched successfully",
        data: result.posts,
        meta: { statusCode: 200, pagination: result.pagination }
    };
})));
// ==========================================
// 📝 CREATE A POST (IMAGE UPLOAD)
// ==========================================
postController.post('/imgupld', Middlewares_1.authenticate, upload_middleware_1.uploadPost.single('image'), (0, validation_middleware_1.default)(post_validators_1.CreatePostSchema), (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postData = {
        content: req.body.content,
        media: req.file ? [req.file.path] : [],
        privacy: req.body.privacy || 'public'
    };
    const _id = req.user._id.toString();
    const result = yield post_service_1.default.createPost(_id, postData);
    return {
        message: "Post created successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
// ==========================================
// 💬 COMMENT OPERATIONS (nested under /:id)
// ==========================================
// EDIT COMMENT (Comment Author Only)
postController.put('/:id/comment/:commentId', Middlewares_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const commentId = parseParamId(req.params.commentId);
    const result = yield post_service_1.default.updateComment(postId, commentId, req.user._id.toString(), req.body.content);
    return { message: "Comment updated", data: result, meta: { statusCode: 200 } };
})));
// DELETE COMMENT (Post Owner OR Comment Author)
postController.delete('/:id/comment/:commentId', Middlewares_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const commentId = parseParamId(req.params.commentId);
    const result = yield post_service_1.default.deleteComment(postId, commentId, req.user._id.toString());
    return { message: "Comment deleted", data: result, meta: { statusCode: 200 } };
})));
// REACT TO COMMENT
postController.post('/:id/comment/:commentId/react', Middlewares_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const commentId = parseParamId(req.params.commentId);
    const result = yield post_service_1.default.reactToComment(postId, commentId, req.user._id.toString(), req.body.type);
    return { message: "Comment reaction updated", data: result, meta: { statusCode: 200 } };
})));
// ADD COMMENT
postController.post('/:id/comment', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.CommentSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const result = yield post_service_1.default.addComment(postId, req.user._id.toString(), req.body.content);
    return {
        message: "Comment added successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
// ==========================================
// 👍 POST ACTIONS (REACTION, REPOST, EDIT, DELETE)
// ==========================================
// POST REACTION
postController.post('/:id/react', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.ReactionSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const result = yield post_service_1.default.addReaction(postId, req.user._id.toString(), req.body.type);
    return {
        message: "Reaction updated",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// REPOST TO PROFILE
postController.post('/:id/repost', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.RepostSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const result = yield post_service_1.default.repost(postId, req.user._id.toString());
    return {
        message: "Post shared to your profile",
        data: result,
        meta: { statusCode: 201 }
    };
})));
// EDIT POST
postController.put('/:id', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.EditPostSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    const result = yield post_service_1.default.updatePost(postId, req.user._id.toString(), req.body.content);
    return {
        message: "Post updated successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// DELETE POST
postController.delete('/:id', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.DeletePostSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseParamId(req.params.id);
    yield post_service_1.default.deletePost(postId, req.user._id.toString());
    return {
        message: "Post deleted successfully",
        data: null,
        meta: { statusCode: 200 }
    };
})));
exports.default = postController;
