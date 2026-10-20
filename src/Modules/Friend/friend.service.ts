import UserModel from "../../DB/Models/user.model";
import { NotFoundException, BadRequestException } from "../../Common/Utils/Errors/exceptions";

class FriendService {
  // Send Friend Request
  sendFriendRequest = async (senderId: string, recipientId: string) => {
    if (senderId === recipientId) {
      throw new BadRequestException("You cannot send a friend request to yourself");
    }

    const [sender, recipient] = await Promise.all([
      UserModel.findById(senderId),
      UserModel.findById(recipientId)
    ]);

    if (!recipient) throw new NotFoundException("User not found");

    // Check if already friends
    const isAlreadyFriend = recipient.friends?.some(
      (id: any) => id.toString() === senderId.toString()
    );
    if (isAlreadyFriend) {
      throw new BadRequestException("You are already friends with this user");
    }

    // Check if request already sent
    const existingRequest = recipient.friendRequests?.find((req: any) => {
      const sId = req.senderId ? req.senderId.toString() : req.toString();
      return sId === senderId.toString();
    });

    if (existingRequest) {
      throw new BadRequestException("Friend request already pending");
    }

    recipient.friendRequests.push({ senderId: senderId as any });
    await recipient.save();

    return { message: "Friend request sent successfully" };
  };

  // Accept Friend Request
  acceptFriendRequest = async (userId: string, senderId: string) => {
    const user = await UserModel.findById(userId);
    const sender = await UserModel.findById(senderId);

    if (!user || !sender) throw new NotFoundException("User not found");

    // Remove from request list properly checking both object sub-doc and raw ID formats
    user.friendRequests = user.friendRequests.filter((req: any) => {
      const sId = req.senderId ? req.senderId.toString() : req.toString();
      return sId !== senderId.toString();
    });

    // Add to both friends lists if not present
    const isUserFriend = user.friends?.some((f: any) => f.toString() === senderId.toString());
    const isSenderFriend = sender.friends?.some((f: any) => f.toString() === userId.toString());

    if (!isUserFriend) user.friends.push(senderId as any);
    if (!isSenderFriend) sender.friends.push(userId as any);

    await Promise.all([user.save(), sender.save()]);

    return { message: "Friend request accepted" };
  };

  // Reject / Cancel Friend Request
  rejectFriendRequest = async (userId: string, senderId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    user.friendRequests = user.friendRequests.filter((req: any) => {
      const sId = req.senderId ? req.senderId.toString() : req.toString();
      return sId !== senderId.toString();
    });

    await user.save();

    return { message: "Friend request removed" };
  };

  // Unfriend User
  unfriend = async (userId: string, targetFriendId: string) => {
    const [user, targetFriend] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(targetFriendId)
    ]);

    if (!user || !targetFriend) throw new NotFoundException("User not found");

    user.friends = user.friends.filter((id: any) => id.toString() !== targetFriendId.toString());
    targetFriend.friends = targetFriend.friends.filter((id: any) => id.toString() !== userId.toString());

    await Promise.all([user.save(), targetFriend.save()]);

    return { message: "Unfriended successfully" };
  };

  // Get Pending Requests for Logged-In User
  getPendingRequests = async (userId: string) => {
    const user = await UserModel.findById(userId).populate(
      "friendRequests.senderId",
      "firstName lastName profilePicture"
    );
    if (!user) throw new NotFoundException("User not found");

    // Filter out invalid/null populates
    return (user.friendRequests || []).filter((req: any) => req.senderId != null);
  };
}

export default new FriendService();