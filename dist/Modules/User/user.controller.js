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
const userController = (0, express_1.Router)();
// GET: Fetch logged-in user's profile
userController.get('/profile', auth_middleware_1.authenticate, // <-- The Guard goes right here!
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Because the Guard let them through, we safely have their ID in req.user!
    const result = yield user_service_1.default.getUserProfile(req.user._id);
    return {
        message: "Profile fetched successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
// PUT: Update logged-in user's profile
userController.put('/profile', // Changed from '/:id' to '/profile'
auth_middleware_1.authenticate, // 🛡️ The Guard intercepts the request here!
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Securely update the user matching the token
    const result = yield user_service_1.default.updateUserProfile(req.user._id, req.body);
    return {
        message: "User profile updated successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
exports.default = userController;
