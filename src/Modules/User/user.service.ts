import UserRepository from "../../DB/Repos/user.repo";
import { NotFoundException } from "../../Common/Utils";
import { UpdateUserBodyType } from "../../Common/Types/type.types";

class UserService {
    constructor(
        private userRepository: UserRepository = new UserRepository()
    ) { }

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

    updateUserProfile = async (userId: string, updateData: UpdateUserBodyType) => {

        delete (updateData as any).password;
        delete (updateData as any).email;
        delete (updateData as any).provider;
        delete (updateData as any).role;

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