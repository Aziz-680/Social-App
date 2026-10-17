"use strict";
// import { Request, Response, NextFunction } from "express";
// import TokenService from "../Common/Services/token.service";
// import { UnauthorizedException } from "../Common/Utils/Errors/exceptions";
// import UserModel from "../DB/Models/user.model";
// export interface ISecureRequest extends Request {
//   user?: any;
//   decodedData?: any;
// }
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
exports.authenticate = void 0;
const token_service_1 = __importDefault(require("../Common/Services/token.service"));
const exceptions_1 = require("../Common/Utils/Errors/exceptions");
const user_model_1 = __importDefault(require("../DB/Models/user.model")); // Add this import
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token = "";
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new exceptions_1.UnauthorizedException("Access denied. No token provided.");
        }
        const decodedPayload = yield token_service_1.default.decodeToken({
            token,
            tokenType: "ACCESS",
        });
        // Extract the ID (Depends on how TokenService nests the payload)
        const userId = (_a = decodedPayload.user) === null || _a === void 0 ? void 0 : _a._id;
        // Fetch fresh user data, exclude password, and populate friends
        const currentUser = yield user_model_1.default.findById(userId)
            .select('-password') // This strictly prevents the password from being returned
            .populate('friends', 'firstName lastName profilePicture'); // Fetches friend details
        if (!currentUser) {
            throw new exceptions_1.UnauthorizedException("User no longer exists.");
        }
        const authenticatedRequest = req;
        authenticatedRequest.user = currentUser;
        authenticatedRequest.decodedData = decodedPayload.decodedData || decodedPayload;
        next();
    }
    catch (error) {
        if (error instanceof exceptions_1.UnauthorizedException) {
            return next(error);
        }
        next(new exceptions_1.UnauthorizedException("Invalid or expired token"));
    }
});
exports.authenticate = authenticate;
