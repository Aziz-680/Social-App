import UserRepository from "../../DB/Repos/user.repo";
import SecurityService from "../../Common/Services/security.service"; 
import TokenService from "../../Common/Services/token.service";
import { ConflictException, BadRequestException } from "../../Common/Utils"; 

class AuthService {
    constructor(
        private userRepository: UserRepository = new UserRepository(),
        // private securityService: SecurityService = new SecurityService(),
        // private tokenService: TokenService = new TokenService()
    ) {}

    registerUser = async (userData: any) => {
        // 1. Check if the user already exists by email
        const existingUser = await this.userRepository.findOneDocument({ email: userData.email });
        if (existingUser) {
            throw new ConflictException("Email is already registered");
        }

        // 2. Hash the password securely using Argon2
        const hashedPassword = await SecurityService.hashPassword(userData.Password);

        // 3. Encrypt the phone number using AES-256
        const encryptedPhone = SecurityService.encrypt(userData.phoneNumber);

        // 4. Prepare the final secure data object
        const secureUserData = {
            ...userData,
            Password: hashedPassword,
            phoneNumber: encryptedPhone 
        };

        // 5. Save to the database 
        const newUser = await this.userRepository.createDocument(secureUserData);

        // 6. Strip out the password before sending the response back to the controller
        const userResponse = newUser.toObject(); 
        delete userResponse.Password;

        return userResponse;
    }

    loginUser = async (loginData: any) => {
        const { email, Password } = loginData;

        // 1. Find user by email
        const user = await this.userRepository.findOneDocument({ email });
        
        // We use BadRequestException for both missing email and bad password 
        // to prevent "Email Enumeration Attacks" (hackers guessing valid emails)
        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        // 2. Verify the Argon2 password hash
        const isPasswordValid = await SecurityService.verifyPassword(user.Password, Password);
        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password");
        }

        // 3. Format the user response (decrypt phone)
        const userResponse = user.toObject();
        if (userResponse.phoneNumber) {
            userResponse.phoneNumber = SecurityService.decrypt(userResponse.phoneNumber);
        }
        
        // 4. Strip out the password hash before returning the object
        delete userResponse.Password;

        // 5. Generate Access and Refresh Tokens
        const tokens = TokenService.createLoginToken({
            payload: { 
                _id: user._id.toString(), 
                role: userResponse.role || 'USER' // Defaults to 'USER' if you haven't set up roles yet
            }
        });

        // 6. Return both the clean user profile and the auth tokens
        return {
            user: userResponse,
            tokens
        };
    }
}

export default new AuthService();