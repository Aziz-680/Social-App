import crypto from 'crypto';
import argon2 from 'argon2';
import { envConfig } from '../../config'; // Adjust path if needed

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = envConfig.encryption.ENCRYPTION_KEY as string; 
const IV_LENGTH = parseInt(envConfig.encryption.IV_LENGTH || '16');

class SecurityService {

    // ==========================================
    // TWO-WAY ENCRYPTION (For sensitive data like phone numbers)
    // ==========================================

    encrypt = (plainText: string): string => {
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

            let encrypted = cipher.update(plainText, 'utf-8', 'hex');
            encrypted += cipher.final('hex');

            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error("Encryption Error:", error);
            throw new Error("Failed to encrypt data");
        }
    }

    decrypt = (encryptedText: string): string => {
        try {
            const textParts = encryptedText.split(':');
            const ivHex = textParts.shift();
            
            if (!ivHex) throw new Error("Invalid encryption format");
            
            const iv = Buffer.from(ivHex, 'hex');
            const encryptedData = Buffer.from(textParts.join(':'), 'hex');

            const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

            let decrypted = decipher.update(encryptedData.toString('hex'), 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');

            return decrypted;
        } catch (error) {
            console.error("Decryption Error:", error);
            throw new Error("Failed to decrypt data");
        }
    }

    // ==========================================
    // ONE-WAY HASHING (For Passwords)
    // ==========================================

    /**
     * Hashes a plain text password using Argon2
     */
    hashPassword = async (plainText: string): Promise<string> => {
        try {
            // Argon2 automatically handles salt generation!
            const hash = await argon2.hash(plainText);
            return hash;
        } catch (error) {
            console.error("Hashing Error:", error);
            throw new Error("Failed to hash password");
        }
    }

    /**
     * Verifies a plain text password against an Argon2 hash
     */
    verifyPassword = async (hash: string, plainText: string): Promise<boolean> => {
        try {
            const isMatch = await argon2.verify(hash, plainText);
            return isMatch;
        } catch (error) {
            console.error("Hash Verification Error:", error);
            throw new Error("Failed to verify password");
        }
    }
}

export default new SecurityService();