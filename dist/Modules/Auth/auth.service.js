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
class AuthService {
    constructor(userRepository = new user_repo_1.default()) {
        this.userRepository = userRepository;
        // Replaced 'any' with RegisterBodyType
        this.registerUser = (userData) => __awaiter(this, void 0, void 0, function* () {
            // 1. Check if the user already exists by email
            const existingUser = yield this.userRepository.findOneDocument({ email: userData.email });
            if (existingUser) {
                throw new Utils_1.ConflictException("Email is already registered");
            }
            // 2. Hash the password securely using Argon2
            const hashedPassword = yield security_service_1.default.hashPassword(userData.password);
            // 3. Encrypt the phone number ONLY if it was provided
            let encryptedPhone;
            if (userData.phoneNumber) {
                encryptedPhone = security_service_1.default.encrypt(userData.phoneNumber);
            }
            // 4. Prepare the final secure data object
            const secureUserData = Object.assign(Object.assign(Object.assign({}, userData), { password: hashedPassword }), (encryptedPhone && { phoneNumber: encryptedPhone }) // Only attach if it exists
            );
            // 5. Save to the database 
            const newUser = yield this.userRepository.createDocument(secureUserData);
            // 6. Strip out the password before sending the response back to the controller
            const userResponse = newUser.toObject();
            delete userResponse.password;
            return userResponse;
        });
        // Replaced 'any' with LoginBodyType
        this.loginUser = (loginData) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = loginData;
            // 1. Find user by email
            const user = yield this.userRepository.findOneDocument({ email });
            if (!user) {
                throw new Utils_1.BadRequestException("Invalid email or password");
            }
            // 2. Verify the Argon2 password hash
            const isPasswordValid = yield security_service_1.default.verifyPassword(user.password, password);
            if (!isPasswordValid) {
                throw new Utils_1.BadRequestException("Invalid email or password");
            }
            // 3. Format the user response (decrypt phone)
            const userResponse = user.toObject();
            if (userResponse.phoneNumber) {
                userResponse.phoneNumber = security_service_1.default.decrypt(userResponse.phoneNumber);
            }
            // 4. Strip out the password hash before returning the object
            delete userResponse.password;
            // 5. Generate Access and Refresh Tokens
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
