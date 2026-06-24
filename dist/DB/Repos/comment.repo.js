"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_model_1 = __importDefault(require("../Models/comment.model"));
const base_repo_1 = __importDefault(require("./base.repo"));
class CommentRepository extends base_repo_1.default {
    constructor() {
        super(comment_model_1.default);
    }
}
exports.default = CommentRepository;
