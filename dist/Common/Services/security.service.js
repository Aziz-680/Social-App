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
const crypto_1 = __importDefault(require("crypto"));
const argon2_1 = __importDefault(require("argon2"));
const config_1 = require("../../config"); // Adjust path if needed
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = config_1.envConfig.encryption.ENCRYPTION_KEY;
const IV_LENGTH = parseInt(config_1.envConfig.encryption.IV_LENGTH || '16');
class SecurityService {
    constructor() {
        // ==========================================
        // TWO-WAY ENCRYPTION (For sensitive data like phone numbers)
        // ==========================================
        this.encrypt = (plainText) => {
            try {
                const iv = crypto_1.default.randomBytes(IV_LENGTH);
                const cipher = crypto_1.default.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
                let encrypted = cipher.update(plainText, 'utf-8', 'hex');
                encrypted += cipher.final('hex');
                return `${iv.toString('hex')}:${encrypted}`;
            }
            catch (error) {
                console.error("Encryption Error:", error);
                throw new Error("Failed to encrypt data");
            }
        };
        this.decrypt = (encryptedText) => {
            try {
                const textParts = encryptedText.split(':');
                const ivHex = textParts.shift();
                if (!ivHex)
                    throw new Error("Invalid encryption format");
                const iv = Buffer.from(ivHex, 'hex');
                const encryptedData = Buffer.from(textParts.join(':'), 'hex');
                const decipher = crypto_1.default.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
                let decrypted = decipher.update(encryptedData.toString('hex'), 'hex', 'utf-8');
                decrypted += decipher.final('utf-8');
                return decrypted;
            }
            catch (error) {
                console.error("Decryption Error:", error);
                throw new Error("Failed to decrypt data");
            }
        };
        // ==========================================
        // ONE-WAY HASHING (For Passwords)
        // ==========================================
        /**
         * Hashes a plain text password using Argon2
         */
        this.hashPassword = (plainText) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Argon2 automatically handles salt generation!
                const hash = yield argon2_1.default.hash(plainText);
                return hash;
            }
            catch (error) {
                console.error("Hashing Error:", error);
                throw new Error("Failed to hash password");
            }
        });
        /**
         * Verifies a plain text password against an Argon2 hash
         */
        this.verifyPassword = (hash, plainText) => __awaiter(this, void 0, void 0, function* () {
            try {
                const isMatch = yield argon2_1.default.verify(hash, plainText);
                return isMatch;
            }
            catch (error) {
                console.error("Hash Verification Error:", error);
                throw new Error("Failed to verify password");
            }
        });
    }
}
exports.default = new SecurityService();
