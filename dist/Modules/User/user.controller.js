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
const user_service_1 = __importDefault(require("./user.service"));
const Middlewares_1 = require("../../Middlewares");
const auth_middleware_1 = require("../../Middlewares/auth.middleware");
const upload_middleware_1 = require("../../Middlewares/upload.middleware");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware"));
const user_validators_1 = require("../../Validators/user.validators");
const user_model_1 = __importDefault(require("../../DB/Models/user.model"));
const userController = (0, express_1.Router)();
// ==========================================
// 1. DYNAMIC & SEARCH ROUTES (Must be defined first)
// ==========================================
// GET: Search users by query
userController.get('/search', auth_middleware_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const q = req.query.q || "";
    const result = yield user_service_1.default.searchUsers(req.user._id.toString(), q);
    return {
        message: "Search results fetched",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// GET: Fetch public profile of another user by ID
userController.get('/profile/:userId', auth_middleware_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const targetUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result = yield user_service_1.default.getPublicProfile(req.user._id.toString(), targetUserId);
    return {
        message: "Public profile fetched successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// ==========================================
// 2. STATIC LOGGED-IN USER ROUTES
// ==========================================
// GET: Fetch logged-in user's profile
userController.get('/profile', auth_middleware_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.default.getUserProfile(req.user._id.toString());
    return {
        message: "Profile fetched successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// POST: Upload Avatar
userController.post('/upload-avatar', auth_middleware_1.authenticate, upload_middleware_1.uploadProfile.single('profilePicture'), (0, Middlewares_1.responseFormatter)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        throw new Error("No image file provided.");
    }
    const imageUrl = req.file.path;
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(req.user._id, { profilePicture: imageUrl }, { new: true }).select('-password');
    return {
        message: "Profile picture updated successfully via Cloudinary",
        data: updatedUser,
        meta: { statusCode: 200 }
    };
})));
// PUT: Update logged-in user's profile
userController.put('/profile', auth_middleware_1.authenticate, (0, validation_middleware_1.default)(user_validators_1.UpdateUserSchema), (0, Middlewares_1.responseFormatter)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.default.updateUserProfile(req.user._id.toString(), req.body);
    return {
        message: "User profile updated successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
exports.default = userController;
