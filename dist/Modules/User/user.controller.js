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
exports.sendFriendRequest = void 0;
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const Middlewares_1 = require("../../Middlewares");
const auth_middleware_1 = require("../../Middlewares/auth.middleware");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware"));
const user_validators_1 = require("../../Validators/user.validators");
const user_model_1 = __importDefault(require("../../DB/Models/user.model"));
const userController = (0, express_1.Router)();
// GET: Fetch logged-in user's profile
userController.get('/profile', auth_middleware_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.default.getUserProfile(req.user._id);
    return {
        message: "Profile fetched successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// PUT: Update logged-in user's profile
userController.put('/profile', auth_middleware_1.authenticate, // 1. Check token
(0, validation_middleware_1.default)(user_validators_1.UpdateUserSchema), // 2. Check data shape
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.default.updateUserProfile(req.user._id, req.body);
    return {
        message: "User profile updated successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.user._id; // The person clicking "Add Friend"
        const targetId = req.params.id; // The person receiving the request
        // 1. Guardrail: Prevent adding yourself
        if (senderId === targetId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend." });
        }
        const targetUser = yield user_model_1.default.findById(targetId);
        const senderUser = yield user_model_1.default.findById(senderId);
        if (!targetUser || !senderUser) {
            return res.status(404).json({ message: "User not found." });
        }
        // 2. Guardrail: Check if they are already friends
        if (targetUser.friends.includes(senderId)) {
            return res.status(400).json({ message: "You are already friends." });
        }
        // 3. Guardrail: Check if a request is already pending
        if (targetUser.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: "Friend request already sent." });
        }
        // 4. The Action: Update both arrays
        targetUser.friendRequests.push(senderId);
        senderUser.sentRequests.push(targetId);
        // Save both documents at the exact same time
        yield Promise.all([targetUser.save(), senderUser.save()]);
        return res.status(200).json({ message: "Friend request sent successfully!" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});
exports.sendFriendRequest = sendFriendRequest;
userController.post('/friend-request/:id', auth_middleware_1.authenticate, exports.sendFriendRequest);
exports.default = userController;
