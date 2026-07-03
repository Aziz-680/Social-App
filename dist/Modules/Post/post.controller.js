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
const postController = (0, express_1.Router)();
// ==========================================
// 🛡️ PROTECTED ROUTE: CREATE A POST
// ==========================================
postController.post('/', Middlewares_1.authenticate, // 1. Guard checks the token and gets the User ID
(0, validation_middleware_1.default)(post_validators_1.CreatePostSchema), // 2. Zod checks the post content
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Pass the securely extracted user ID and the validated body to the service
    const result = yield post_service_1.default.createPost(req.user._id, req.body);
    return {
        message: "Post created successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
postController.put('/:id/like', Middlewares_1.authenticate, // 1. Must be logged in
(0, validation_middleware_1.default)(post_validators_1.LikePostSchema), // 2. Ensure :id parameter is a valid MongoDB ID
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Normalize the postId param and pass the userId from the token
    const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = yield post_service_1.default.toggleLike(postId, req.user._id);
    return {
        message: "Post like toggled successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
postController.delete('/:id', Middlewares_1.authenticate, // 1. Guard checks IF they are logged in
(0, validation_middleware_1.default)(post_validators_1.DeletePostSchema), // 2. Zod checks the ID format
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Normalize the postId param and pass the userId from the token to the service
    const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    yield post_service_1.default.deletePost(postId, req.user._id);
    return {
        message: "Post deleted successfully",
        data: null,
        meta: { statusCode: 200 }
    };
})));
// ==========================================
// 🌍 PUBLIC ROUTE: GET ALL POSTS
// ==========================================
postController.get('/', (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // 2. Pass them to the service
    const result = yield post_service_1.default.getAllPosts(page, limit);
    return {
        message: "Timeline fetched successfully",
        data: result.posts,
        meta: {
            statusCode: 200,
            pagination: result.pagination
        }
    };
})));
exports.default = postController;
