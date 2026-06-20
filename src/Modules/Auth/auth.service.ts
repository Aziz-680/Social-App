import UserRepository from "../../DB/Repos/user.repo";
import SecurityService from "../../Common/Services/security.service"; 
import TokenService from "../../Common/Services/token.service";
import { ConflictException, BadRequestException } from "../../Common/Utils"; 
import { RegisterBodyType, LoginBodyType } from "../../Common/Types"; // Importing your inferred types!

class AuthService {
    constructor(
        private userRepository: UserRepository = new UserRepository(),
    ) {}

    // Replaced 'any' with RegisterBodyType
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
            ...(encryptedPhone && { phoneNumber: encryptedPhone }) // Only attach if it exists
        };

        // 5. Save to the database 
        const newUser = await this.userRepository.createDocument(secureUserData);

        // 6. Strip out the password before sending the response back to the controller
        const userResponse = newUser.toObject(); 
        delete userResponse.password;

        return userResponse;
    }

    // Replaced 'any' with LoginBodyType
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
}

export default new AuthService();