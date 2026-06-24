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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const user_repo_1 = __importDefault(require("../../DB/Repos/user.repo"));
const security_service_1 = __importDefault(require("../../Common/Services/security.service"));
const exceptions_1 = require("../../Common/Utils/Errors/exceptions");
const enums_1 = require("../Types/enums");
class TokenService {
    constructor() {
        this.generateToken = ({ payload, secret, options }) => {
            return jsonwebtoken_1.default.sign(payload, secret, options || {});
        };
        this.verifyToken = ({ token, secret, options }) => {
            return jsonwebtoken_1.default.verify(token, secret, options);
        };
        this.detectSignatureByRole = ({ role }) => {
            // We cast to 'any' here or explicitly define the jwt config structure in envConfig
            const jwtSecrets = config_1.envConfig.jwt;
            if (role === enums_1.USER_ROLES.USER) {
                return jwtSecrets.user;
            }
            else {
                return jwtSecrets.admin;
            }
        };
        this.getSignatureByTypeAndRole = ({ role, tokenType, both = false }) => {
            const signatures = this.detectSignatureByRole({ role });
            if (both)
                return signatures;
            let tokenSignature;
            switch (tokenType) {
                case enums_1.TOKEN_TYPES.ACCESS:
                    tokenSignature = signatures.accessSignature;
                    break;
                case enums_1.TOKEN_TYPES.REFRESH:
                    tokenSignature = signatures.refreshSignature;
                    break;
                default:
                    throw new exceptions_1.BadRequestException('Invalid Token Type');
            }
            return tokenSignature;
        };
        this.createLoginToken = ({ payload, options = {}, requiredToken }) => {
            const signatures = this.getSignatureByTypeAndRole({ role: payload.role, both: true });
            let accessToken;
            let refreshToken;
            switch (requiredToken) {
                case enums_1.TOKEN_TYPES.ACCESS:
                    accessToken = this.generateToken({
                        payload,
                        secret: signatures.accessSignature,
                        options: options.access
                    });
                    break;
                case enums_1.TOKEN_TYPES.REFRESH:
                    refreshToken = this.generateToken({
                        payload,
                        secret: signatures.refreshSignature,
                        options: options.refresh
                    });
                    break;
                default:
                    accessToken = this.generateToken({
                        payload,
                        secret: signatures.accessSignature,
                        options: options.access
                    });
                    refreshToken = this.generateToken({
                        payload,
                        secret: signatures.refreshSignature,
                        options: options.refresh
                    });
                    break;
            }
            return { accessToken, refreshToken };
        };
        this.decodeToken = (_a) => __awaiter(this, [_a], void 0, function* ({ token, tokenType }) {
            const data = jsonwebtoken_1.default.decode(token);
            if (!data || !data.role) {
                throw new exceptions_1.BadRequestException('Invalid Payload');
            }
            const signature = this.getSignatureByTypeAndRole({ role: data.role, tokenType });
            const decodedData = this.verifyToken({ token, secret: signature });
            // Use your BaseRepository method
            console.log(decodedData);
            const user = yield this.userRepo.findDocumentById(decodedData._id);
            if (!user)
                throw new exceptions_1.NotFoundException("User not found");
            // Convert the mongoose document to a plain object so we can modify properties
            const userObj = user.toObject();
            if (userObj.phoneNumber) {
                // Replaced the standalone decrypt call with your new SecurityService
                userObj.phoneNumber = security_service_1.default.decrypt(userObj.phoneNumber);
            }
            return { user: userObj, decodedData };
        });
        this.userRepo = new user_repo_1.default();
    }
}
exports.default = new TokenService();
