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
const user_model_1 = __importDefault(require("../../DB/Models/user.model"));
const Utils_1 = require("../../Common/Utils");
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
        this.updateUserProfile = (userId, updateData) => __awaiter(this, void 0, void 0, function* () {
            delete updateData.password;
            delete updateData.email;
            delete updateData.provider;
            delete updateData.role;
            const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, updateData, { new: true })
                .select("-password")
                .exec();
            if (!updatedUser) {
                throw new Utils_1.NotFoundException("User not found to update");
            }
            return updatedUser.toObject();
        });
        // 2. Search users by name or email (excluding current user)
        this.searchUsers = (currentUserId, query) => __awaiter(this, void 0, void 0, function* () {
            if (!query || query.trim() === "")
                return [];
            const searchRegex = new RegExp(query, "i");
            const users = yield user_model_1.default.find({
                _id: { $ne: currentUserId },
                $or: [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { email: searchRegex }
                ]
            }).select("firstName lastName email profilePicture status friends friendRequests").limit(10).exec();
            return users.map((u) => {
                var _a, _b;
                const isFriend = (_a = u.friends) === null || _a === void 0 ? void 0 : _a.some((f) => f.toString() === currentUserId.toString());
                const isPending = (_b = u.friendRequests) === null || _b === void 0 ? void 0 : _b.some((req) => (req.senderId ? req.senderId.toString() : req.toString()) === currentUserId.toString());
                return {
                    _id: u._id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    profilePicture: u.profilePicture,
                    status: u.status,
                    friendshipStatus: isFriend ? "friends" : isPending ? "pending" : "none"
                };
            });
        });
        // 3. Fetch Public Profile by User ID
        this.getPublicProfile = (currentUserId, targetUserId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const user = yield user_model_1.default.findById(targetUserId)
                .select("firstName lastName email profilePicture status friends friendRequests")
                .exec();
            if (!user)
                throw new Utils_1.NotFoundException("User not found");
            const isFriend = (_a = user.friends) === null || _a === void 0 ? void 0 : _a.some((f) => f.toString() === currentUserId.toString());
            const isPending = (_b = user.friendRequests) === null || _b === void 0 ? void 0 : _b.some((req) => (req.senderId ? req.senderId.toString() : req.toString()) === currentUserId.toString());
            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture,
                status: user.status,
                friendsCount: ((_c = user.friends) === null || _c === void 0 ? void 0 : _c.length) || 0,
                friendshipStatus: isFriend ? "friends" : isPending ? "pending" : "none"
            };
        });
    }
}
exports.default = new UserService();
