"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repo_js_1 = __importDefault(require("../../DB/Repos/user.repo.js"));
class AuthService {
    constructor(userRepository = new user_repo_js_1.default()) {
        this.userRepository = userRepository;
        this.health = (body) => {
            this.userRepository.findDocuments({}, {});
            return body;
        };
    }
}
exports.default = new AuthService();
