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
const post_repo_1 = __importDefault(require("../../DB/Repos/post.repo"));
class PostService {
    constructor(postRepository = new post_repo_1.default()) {
        this.postRepository = postRepository;
        this.createPost = (userId, postData) => __awaiter(this, void 0, void 0, function* () {
            const newPostData = Object.assign(Object.assign({}, postData), { userId });
            const post = yield this.postRepository.createDocument(newPostData);
            return post;
        });
        this.getAllPosts = () => __awaiter(this, void 0, void 0, function* () {
            const posts = yield this.postRepository.findDocuments({}, { sort: { createdAt: -1 } });
            return posts;
        });
    }
}
exports.default = new PostService();
