import UserRepository from "../../DB/Repos/user.repo";
import UserModel from "../../DB/Models/user.model";
import { NotFoundException } from "../../Common/Utils";
import { UpdateUserBodyType } from "../../Common/Types/type.types";

class UserService {
    constructor(
        private userRepository: UserRepository = new UserRepository()
    ) { }

    // 1. Fetch logged-in user profile directly via Mongoose model
    getUserProfile = async (userId: string) => {
        const user = await UserModel.findById(userId).select("-password").exec();

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user.toObject();
    }

    updateUserProfile = async (userId: string, updateData: UpdateUserBodyType) => {
        delete (updateData as any).password;
        delete (updateData as any).email;
        delete (updateData as any).provider;
        delete (updateData as any).role;

        const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true })
            .select("-password")
            .exec();

        if (!updatedUser) {
            throw new NotFoundException("User not found to update");
        }

        return updatedUser.toObject();
    }

    // 2. Search users by name or email (excluding current user)
    searchUsers = async (currentUserId: string, query: string) => {
        if (!query || query.trim() === "") return [];

        const searchRegex = new RegExp(query, "i");

        const users = await UserModel.find({
            _id: { $ne: currentUserId },
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ]
        }).select("firstName lastName email profilePicture status friends friendRequests").limit(10).exec();

        return users.map((u: any) => {
            const isFriend = u.friends?.some((f: any) => f.toString() === currentUserId.toString());
            const isPending = u.friendRequests?.some((req: any) => 
                (req.senderId ? req.senderId.toString() : req.toString()) === currentUserId.toString()
            );

            return {
                _id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                profilePicture: u.profilePicture,
                status: u.status,
                friendshipStatus: isFriend ? "friends" : isPending ? "pending" : "none"
            };
        });
    }

    // 3. Fetch Public Profile by User ID
    getPublicProfile = async (currentUserId: string, targetUserId: string) => {
        const user = await UserModel.findById(targetUserId)
            .select("firstName lastName email profilePicture status friends friendRequests")
            .exec();

        if (!user) throw new NotFoundException("User not found");

        const isFriend = user.friends?.some((f: any) => f.toString() === currentUserId.toString());
        const isPending = user.friendRequests?.some((req: any) => 
            (req.senderId ? req.senderId.toString() : req.toString()) === currentUserId.toString()
        );

        return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
            status: user.status,
            friendsCount: user.friends?.length || 0,
            friendshipStatus: isFriend ? "friends" : isPending ? "pending" : "none"
        };
    }
}

export default new UserService();