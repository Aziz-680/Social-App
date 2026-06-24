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
const comment_service_1 = __importDefault(require("./comment.service"));
const Middlewares_1 = require("../../Middlewares");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware"));
const comment_valiators_1 = require("../../Validators/comment.valiators");
const commentController = (0, express_1.Router)();
// ==========================================
// 🛡️ PROTECTED ROUTE: ADD A COMMENT
// ==========================================
commentController.post('/', Middlewares_1.authenticate, // You must be logged in to comment
(0, validation_middleware_1.default)(comment_valiators_1.CreateCommentSchema), // Checks the content & postId
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_service_1.default.createComment(req.user._id, req.body);
    return {
        message: "Comment added successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
// ==========================================
// 🌍 PUBLIC ROUTE: GET COMMENTS FOR A POST
// ==========================================
commentController.get('/:postId', 
// No guard here! Anyone can read comments.
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Grab the postId from the URL parameters
    const result = yield comment_service_1.default.getCommentsByPostId(req.params.postId);
    return {
        message: "Comments fetched successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
exports.default = commentController;
