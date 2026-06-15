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
const auth_service_1 = __importDefault(require("./auth.service"));
const Middlewares_1 = require("../../Middlewares");
const validation_middleware_1 = __importDefault(require("../../Middlewares/validation.middleware")); // Your instructor's middleware
const auth_validators_1 = require("../../Validators/auth.validators");
const authController = (0, express_1.Router)();
// Registration endpoint
authController.post('/register', (0, validation_middleware_1.default)(auth_validators_1.RegisterSchema), // Passed directly!
(0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.default.registerUser(req.body);
    return {
        message: "User registered successfully",
        data: result,
        meta: { statusCode: 201 }
    };
})));
// Login endpoint
authController.post('/login', (0, validation_middleware_1.default)(auth_validators_1.LoginSchema), (0, Middlewares_1.responseFormatter)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.default.loginUser(req.body);
    return {
        message: "User logged in successfully",
        data: result,
        meta: { statusCode: 200 }
    };
})));
exports.default = authController;
