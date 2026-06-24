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
const user_repo_1 = __importDefault(require("../../DB/Repos/user.repo"));
const Utils_1 = require("../../Common/Utils");
class UserService {
    constructor(userRepository = new user_repo_1.default()) {
        this.userRepository = userRepository;
        // 1. Fetch a single user by their ID
        this.getUserProfile = (userId) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findDocumentById(userId);
            if (!user) {
                throw new Utils_1.NotFoundException("User not found");
            }
            const userProfile = user.toObject();
            delete userProfile.password;
            return userProfile;
        });
        this.updateUserProfile = (userId, updateData) => __awaiter(this, void 0, void 0, function* () {
            delete updateData.password;
            delete updateData.email;
            delete updateData.provider;
            delete updateData.role;
            const updatedUser = yield this.userRepository.updateDocument(userId, updateData);
            if (!updatedUser) {
                throw new Utils_1.NotFoundException("User not found to update");
            }
            const userProfile = updatedUser.toObject();
            delete userProfile.password;
            return userProfile;
        });
    }
}
exports.default = new UserService();
