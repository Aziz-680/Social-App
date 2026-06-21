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
exports.authenticate = void 0;
const token_service_1 = __importDefault(require("../Common/Services/token.service"));
const exceptions_1 = require("../Common/Utils/Errors/exceptions");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 2. Extract the Authorization header
        const authHeader = req.headers.authorization;
        // 3. Check if the header exists and follows the "Bearer <token>" format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new exceptions_1.UnauthorizedException("Access denied. No token provided.");
        }
        // 4. Split the string to get just the token part
        const token = authHeader.split(' ')[1];
        // 5. Decode and verify the token using your TokenService
        const decodedPayload = yield token_service_1.default.decodeToken({ token, tokenType: 'ACCESS' });
        // 6. Attach the decoded payload (which has the _id) to the request object
        req.user = decodedPayload.user;
        req.decodedData = decodedPayload.decodedData;
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
