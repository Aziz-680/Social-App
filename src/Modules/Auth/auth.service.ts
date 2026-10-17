import UserRepository from "../../DB/Repos/user.repo";
import SecurityService from "../../Common/Services/security.service"; 
import TokenService from "../../Common/Services/token.service";
import { ConflictException, BadRequestException } from "../../Common/Utils"; 
import { RegisterBodyType, LoginBodyType } from "../../Common/Types"; 
import { OAuth2Client } from 'google-auth-library';
import { STATUS } from "../../Common/Types/enums";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    constructor(
        private userRepository: UserRepository = new UserRepository(),
    ) {}

    registerUser = async (userData: RegisterBodyType) => { 
        const existingUser = await this.userRepository.findOneDocument({ email: userData.email });
        if (existingUser) {
            throw new ConflictException("Email is already registered");
        }

        const hashedPassword = await SecurityService.hashPassword(userData.password);

        let encryptedPhone;
        if (userData.phoneNumber) {
            encryptedPhone = SecurityService.encrypt(userData.phoneNumber);
        }

        const secureUserData = {
            ...userData,
            password: hashedPassword,
            status: STATUS.ACTIVE,
            ...(encryptedPhone && { phoneNumber: encryptedPhone }) 
        };

        const newUser = await this.userRepository.createDocument(secureUserData);
        const userResponse = newUser.toObject(); 
        delete userResponse.password;

        return userResponse;
    }

    loginUser = async (loginData: LoginBodyType) => {
        const { email, password } = loginData;

        const user = await this.userRepository.findOneDocument({ email });
        
        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        const isPasswordValid = await SecurityService.verifyPassword(user.password, password);
        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password");
        }

        // Set status to 'active' on successful login
        const updatedUser = await this.userRepository.updateDocument(user._id, { 
            lastLogin: new Date(),
            status: STATUS.ACTIVE 
        });

        const userResponse = (updatedUser || user).toObject();
        if (userResponse.phoneNumber) {
            userResponse.phoneNumber = SecurityService.decrypt(userResponse.phoneNumber);
        }
        
        delete userResponse.password;

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

    googleLogin = async (googleToken: string) => {
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new BadRequestException("Invalid Google Token");
        }

        const { email, given_name, family_name, picture } = payload;

        let user = await this.userRepository.findOneDocument({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await SecurityService.hashPassword(randomPassword);

            user = await this.userRepository.createDocument({
                firstName: given_name || "Google",
                lastName: family_name || "User",
                email: email,
                password: hashedPassword,
                profilePicture: picture,
                status: STATUS.ACTIVE
            });
        } else {
            const updatedUser = await this.userRepository.updateDocument(user._id, { 
                lastLogin: new Date(),
                status: STATUS.ACTIVE 
            });
            user = updatedUser || user;
        }

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        if (userResponse.phoneNumber) {
            userResponse.phoneNumber = SecurityService.decrypt(userResponse.phoneNumber);
        }

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