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
const upload_middleware_1 = require("../../Middlewares/upload.middleware");
const postController = (0, express_1.Router)();
// ==========================================
// 🛡️ PROTECTED ROUTE: CREATE A POST
// ==========================================
postController.post('/imgupld', Middlewares_1.authenticate, upload_middleware_1.upload.single('image'), (0, validation_middleware_1.default)(post_validators_1.CreatePostSchema), (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postData = {
        content: req.body.content,
        media: req.file ? [req.file.path] : []
    };
    const _id = req.user._id;
    const result = yield post_service_1.default.createPost(_id, postData);
    return {
        message: "Post created successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
postController.put('/:id/like', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.LikePostSchema), (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = yield post_service_1.default.toggleLike(postId, req.user._id);
    return {
        message: "Post like toggled successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
postController.delete('/:id', Middlewares_1.authenticate, (0, validation_middleware_1.default)(post_validators_1.DeletePostSchema), (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
