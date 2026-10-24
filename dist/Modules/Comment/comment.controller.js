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
const Middlewares_1 = require("../../Middlewares");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware"));
const comment_valiators_1 = require("../../Validators/comment.valiators");
const post_service_1 = __importDefault(require("../Post/post.service"));
const commentController = (0, express_1.Router)();
// ==========================================
// 🛡️ PROTECTED ROUTE: ADD A COMMENT
// ==========================================
commentController.post('/', Middlewares_1.authenticate, // You must be logged in to comment
(0, validation_middleware_1.default)(comment_valiators_1.CreateCommentSchema), // Checks the content & postId
(0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_1.default.addComment(req.body.postId, req.user._id.toString(), req.body.content);
    return {
        message: "Comment added successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
// ==========================================
// 🛡️ PROTECTED ROUTE: GET COMMENTS FOR A POST
// ==========================================
commentController.get('/:postId', Middlewares_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const result = yield post_service_1.default.getPostComments(postId, req.user._id.toString());
    return {
        message: "Comments fetched successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
exports.default = commentController;
