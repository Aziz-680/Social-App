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
const auth_middleware_1 = require("../../Middlewares/auth.middleware");
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const Middlewares_1 = require("../../Middlewares");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware"));
const auth_validators_1 = require("../../Validators/auth.validators");
const user_model_1 = __importDefault(require("../../DB/Models/user.model"));
const authController = (0, express_1.Router)();
authController.get("/me", auth_middleware_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const secureReq = req;
    return {
        message: "Session is valid",
        data: {
            user: secureReq.user,
            decodedData: secureReq.decodedData,
        },
        meta: { statusCode: 200 },
    };
})));
authController.post("/register", (0, validation_middleware_1.default)(auth_validators_1.RegisterSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.default.registerUser(req.body);
    return {
        message: "User registered successfully",
        data: result,
        meta: { statusCode: 201 },
    };
})));
authController.post("/login", (0, validation_middleware_1.default)(auth_validators_1.LoginSchema), (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.default.loginUser(req.body);
    const { user, tokens } = result;
    res.cookie("token", tokens.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
        message: "User logged in successfully",
        data: { user },
        meta: { statusCode: 200 },
    };
})));
authController.post("/google", (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { googleToken } = req.body;
    if (!googleToken) {
        res.status(400);
        throw new Error("Google token is required");
    }
    const result = yield auth_service_1.default.googleLogin(googleToken);
    const { user, tokens } = result;
    res.cookie("token", tokens.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
        message: "Google login successful",
        data: { user },
        meta: { statusCode: 200 },
    };
})));
// Unified Single Logout Route
authController.post("/logout", auth_middleware_1.authenticate, (0, Middlewares_1.responseFormatter)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const secureReq = req;
    if ((_a = secureReq.user) === null || _a === void 0 ? void 0 : _a._id) {
        yield user_model_1.default.findByIdAndUpdate(secureReq.user._id, {
            status: "offline",
        });
    }
    res.clearCookie("token");
    return {
        message: "Logged out successfully",
        data: null,
        meta: { statusCode: 200 },
    };
})));
exports.default = authController;
