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
const security_service_1 = __importDefault(require("../../Common/Services/security.service"));
const token_service_1 = __importDefault(require("../../Common/Services/token.service"));
const Utils_1 = require("../../Common/Utils");
const google_auth_library_1 = require("google-auth-library");
const enums_1 = require("../../Common/Types/enums");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class AuthService {
    constructor(userRepository = new user_repo_1.default()) {
        this.userRepository = userRepository;
        this.registerUser = (userData) => __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userRepository.findOneDocument({ email: userData.email });
            if (existingUser) {
                throw new Utils_1.ConflictException("Email is already registered");
            }
            const hashedPassword = yield security_service_1.default.hashPassword(userData.password);
            let encryptedPhone;
            if (userData.phoneNumber) {
                encryptedPhone = security_service_1.default.encrypt(userData.phoneNumber);
            }
            const secureUserData = Object.assign(Object.assign(Object.assign({}, userData), { password: hashedPassword, status: enums_1.STATUS.ACTIVE }), (encryptedPhone && { phoneNumber: encryptedPhone }));
            const newUser = yield this.userRepository.createDocument(secureUserData);
            const userResponse = newUser.toObject();
            delete userResponse.password;
            return userResponse;
        });
        this.loginUser = (loginData) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = loginData;
            const user = yield this.userRepository.findOneDocument({ email });
            if (!user) {
                throw new Utils_1.BadRequestException("Invalid email or password");
            }
            const isPasswordValid = yield security_service_1.default.verifyPassword(user.password, password);
            if (!isPasswordValid) {
                throw new Utils_1.BadRequestException("Invalid email or password");
            }
            // Set status to 'active' on successful login
            const updatedUser = yield this.userRepository.updateDocument(user._id, {
                lastLogin: new Date(),
                status: enums_1.STATUS.ACTIVE
            });
            const userResponse = (updatedUser || user).toObject();
            if (userResponse.phoneNumber) {
                userResponse.phoneNumber = security_service_1.default.decrypt(userResponse.phoneNumber);
            }
            delete userResponse.password;
            const tokens = token_service_1.default.createLoginToken({
                payload: {
                    _id: user._id.toString(),
                    role: userResponse.role || 'USER'
                }
            });
            return {
                user: userResponse,
                tokens
            };
        });
        this.googleLogin = (googleToken) => __awaiter(this, void 0, void 0, function* () {
            const ticket = yield googleClient.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new Utils_1.BadRequestException("Invalid Google Token");
            }
            const { email, given_name, family_name, picture } = payload;
            let user = yield this.userRepository.findOneDocument({ email });
            if (!user) {
                const randomPassword = Math.random().toString(36).slice(-10);
                const hashedPassword = yield security_service_1.default.hashPassword(randomPassword);
                user = yield this.userRepository.createDocument({
                    firstName: given_name || "Google",
                    lastName: family_name || "User",
                    email: email,
                    password: hashedPassword,
                    profilePicture: picture,
                    status: enums_1.STATUS.ACTIVE
                });
            }
            else {
                const updatedUser = yield this.userRepository.updateDocument(user._id, {
                    lastLogin: new Date(),
                    status: enums_1.STATUS.ACTIVE
                });
                user = updatedUser || user;
            }
            if (!user) {
                throw new Utils_1.BadRequestException("User not found");
            }
            const userResponse = user.toObject();
            delete userResponse.password;
            if (userResponse.phoneNumber) {
                userResponse.phoneNumber = security_service_1.default.decrypt(userResponse.phoneNumber);
            }
            const tokens = token_service_1.default.createLoginToken({
                payload: {
                    _id: user._id.toString(),
                    role: userResponse.role || 'USER'
                }
            });
            return {
                user: userResponse,
                tokens
            };
        });
    }
}
exports.default = new AuthService();
