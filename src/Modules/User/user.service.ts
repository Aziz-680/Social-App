import UserRepository from "../../DB/Repos/user.repo";
import { NotFoundException } from "../../Common/Utils"; 

class UserService {
    constructor(
        private userRepository: UserRepository = new UserRepository()
    ) {}

    // 1. Fetch a single user by their ID
    getUserProfile = async (userId: string) => {
        const user = await this.userRepository.findDocumentById(userId as any);
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const userProfile = user.toObject();
        delete userProfile.password;

        return userProfile;
    }

    // 2. Update a user's profile information
    updateUserProfile = async (userId: string, updateData: any) => {
        
        delete updateData.password;
        delete updateData.email; 
        delete updateData.provider; 
        delete updateData.role; 

        
        const updatedUser = await this.userRepository.updateDocument(userId as any, updateData);

        if (!updatedUser) {
            throw new NotFoundException("User not found to update");
        }

        const userProfile = updatedUser.toObject();
        delete userProfile.password;

        return userProfile;
    }
}

export default new UserService();