import UserRepository from "../../DB/Repos/user.repo";
import SecurityService from "../../Common/Services/security.service"; 
import TokenService from "../../Common/Services/token.service";
import { ConflictException, BadRequestException } from "../../Common/Utils"; 
import { RegisterBodyType, LoginBodyType } from "../../Common/Types"; 
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    constructor(
        private userRepository: UserRepository = new UserRepository(),
    ) {}

    registerUser = async (userData: RegisterBodyType) => { 
        // 1. Check if the user already exists by email
        const existingUser = await this.userRepository.findOneDocument({ email: userData.email });
        if (existingUser) {
            throw new ConflictException("Email is already registered");
        }

        // 2. Hash the password securely using Argon2
        const hashedPassword = await SecurityService.hashPassword(userData.password);

        // 3. Encrypt the phone number ONLY if it was provided
        let encryptedPhone;
        if (userData.phoneNumber) {
            encryptedPhone = SecurityService.encrypt(userData.phoneNumber);
        }

        // 4. Prepare the final secure data object
        const secureUserData = {
            ...userData,
            password: hashedPassword,
            ...(encryptedPhone && { phoneNumber: encryptedPhone }) 
        };

        // 5. Save to the database 
        const newUser = await this.userRepository.createDocument(secureUserData);

        // 6. Strip out the password before sending the response back to the controller
        const userResponse = newUser.toObject(); 
        delete userResponse.password;

        return userResponse;
    }

    loginUser = async (loginData: LoginBodyType) => {
        const { email, password } = loginData;

        // 1. Find user by email
        const user = await this.userRepository.findOneDocument({ email });
        
        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        // 2. Verify the Argon2 password hash
        const isPasswordValid = await SecurityService.verifyPassword(user.password, password);
        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password");
        }

        // 3. Format the user response (decrypt phone)
        const userResponse = user.toObject();
        if (userResponse.phoneNumber) {
            userResponse.phoneNumber = SecurityService.decrypt(userResponse.phoneNumber);
        }
        
        // 4. Strip out the password hash before returning the object
        delete userResponse.password;

        // 5. Generate Access and Refresh Tokens
        const tokens = TokenService.createLoginToken({
            payload: { 
                _id: user._id.toString(), 
                role: userResponse.role || 'USER' 
            }
        });

        return {
            user: userResponse,
            tokens
        };
    }

    // ==========================================
    // 🆕 GOOGLE LOGIN METHOD
    // ==========================================
    googleLogin = async (googleToken: string) => {
        // 1. Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new BadRequestException("Invalid Google Token");
        }

        const { email, given_name, family_name, picture } = payload;

        // 2. Check if the user already exists in your MongoDB
        let user = await this.userRepository.findOneDocument({ email });

        // 3. If they don't exist, create a new account for them instantly
        if (!user) {
            // Generate a random string to satisfy the database password requirement and hash it
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await SecurityService.hashPassword(randomPassword);

            user = await this.userRepository.createDocument({
                firstName: given_name || "Google",
                lastName: family_name || "User",
                email: email,
                password: hashedPassword,
                profilePicture: picture 
            });
        }

        // 4. Format the user response (decrypt phone if it somehow exists)
        const userResponse = user.toObject();
        delete userResponse.password;
        if (userResponse.phoneNumber) {
            userResponse.phoneNumber = SecurityService.decrypt(userResponse.phoneNumber);
        }

        // 5. Generate Access and Refresh Tokens using your custom TokenService
        const tokens = TokenService.createLoginToken({
            payload: { 
                _id: user._id.toString(), 
                role: userResponse.role || 'USER' 
            }
        });

        return {
            user: userResponse,
            tokens
        };
    }
}

export default new AuthService();