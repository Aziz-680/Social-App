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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_repo_1 = __importDefault(require("../../DB/Repos/user.repo"));
const Utils_1 = require("../../Common/Utils");
const user_model_1 = __importDefault(require("../../DB/Models/user.model"));
class UserService {
    constructor(userRepository = new user_repo_1.default()) {
        this.userRepository = userRepository;
        // 1. Fetch logged-in user profile directly via Mongoose model
        this.getUserProfile = (userId) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(userId).select("-password").exec();
            if (!user) {
                throw new Utils_1.NotFoundException("User not found");
            }
            return user.toObject();
        });
        this.getPublicProfile = (userId) => __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Utils_1.BadRequestException("Invalid user ID");
            }
            const user = yield user_model_1.default.findById(userId)
                .select("firstName lastName profilePicture coverPictures age gender workExperience createdAt");
            if (!user) {
                throw new Utils_1.NotFoundException("User not found");
            }
            return user;
        });
        this.searchUsers = (search, currentUserId, page, limit) => __awaiter(this, void 0, void 0, function* () {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const filter = {
                _id: { $ne: currentUserId },
                $or: [
                    { firstName: { $regex: escapedSearch, $options: "i" } },
                    { lastName: { $regex: escapedSearch, $options: "i" } },
                    { email: { $regex: escapedSearch, $options: "i" } }
                ]
            };
            const skip = (page - 1) * limit;
            const [users, total] = yield Promise.all([
                user_model_1.default.find(filter)
                    .select("firstName lastName profilePicture")
                    .sort({ firstName: 1, lastName: 1 })
                    .skip(skip)
                    .limit(limit),
                user_model_1.default.countDocuments(filter)
            ]);
            return {
                users,
                pagination: {
                    totalItems: total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit
                }
            };
        });
        this.updateUserProfile = (userId, updateData) => __awaiter(this, void 0, void 0, function* () {
            const _a = updateData, { password: _password, email: _email, provider: _provider, role: _role } = _a, safeUpdateData = __rest(_a, ["password", "email", "provider", "role"]);
            const updatedUser = yield this.userRepository.updateDocument(userId, safeUpdateData);
            if (!updatedUser) {
                throw new Utils_1.NotFoundException("User not found to update");
            }
            return updatedUser.toObject();
        });
    }
}
exports.default = new UserService();
