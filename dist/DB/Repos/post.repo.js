"use strict";
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
}
exports.default = PostRepository;
