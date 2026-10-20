import { Types } from "mongoose";
import UserRepository from "../../DB/Repos/user.repo";
import { BadRequestException, NotFoundException } from "../../Common/Utils";
import { UpdateUserBodyType } from "../../Common/Types/type.types";
import UserModel from "../../DB/Models/user.model";

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

    getPublicProfile = async (userId: string) => {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException("Invalid user ID");
        }
        const user = await UserModel.findById(userId)
            .select("firstName lastName profilePicture coverPictures age gender workExperience createdAt");

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    searchUsers = async (search: string, currentUserId: string, page: number, limit: number) => {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = {
            _id: { $ne: currentUserId },
            $or: [
                { firstName: { $regex: escapedSearch, $options: "i" } },
                { lastName: { $regex: escapedSearch, $options: "i" } },
                { email: { $regex: escapedSearch, $options: "i" } }
            ]
        };
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .select("firstName lastName profilePicture")
                .sort({ firstName: 1, lastName: 1 })
                .skip(skip)
                .limit(limit),
            UserModel.countDocuments(filter)
        ]);

        return {
            users,
            pagination: {
                totalItems: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                limit
            }
        };
    }

    updateUserProfile = async (userId: string, updateData: UpdateUserBodyType) => {
        const {
            password: _password,
            email: _email,
            provider: _provider,
            role: _role,
            ...safeUpdateData
        } = updateData as UpdateUserBodyType & {
            password?: string;
            email?: string;
            provider?: string;
            role?: string;
        };
        const updatedUser = await this.userRepository.updateDocument(userId, safeUpdateData);

        if (!updatedUser) {
            throw new NotFoundException("User not found to update");
        }

        const userProfile = updatedUser.toObject();
        delete userProfile.password;

        return userProfile;
    }
}

export default new UserService();