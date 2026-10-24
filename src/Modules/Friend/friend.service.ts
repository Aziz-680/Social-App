import { Types } from "mongoose";
import UserModel from "../../DB/Models/user.model";
import { BadRequestException, NotFoundException } from "../../Common/Utils/Errors/exceptions";

const isSameId = (left: Types.ObjectId | string, right: Types.ObjectId | string) =>
  left.toString() === right.toString();

class FriendService {
  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid user ID");
    }
  }

  sendFriendRequest = async (senderId: string, recipientId: string) => {
    this.validateId(recipientId);
    if (isSameId(senderId, recipientId)) {
      throw new BadRequestException("You cannot send a friend request to yourself");
    }

    const [sender, recipient] = await Promise.all([
      UserModel.findById(senderId),
      UserModel.findById(recipientId)
    ]);
    if (!sender || !recipient) throw new NotFoundException("User not found");
    if (sender.friends.some((id: Types.ObjectId) => isSameId(id, recipientId))) {
      throw new BadRequestException("You are already friends with this user");
    }
    if (recipient.friendRequests.some((id: Types.ObjectId) => isSameId(id, senderId))) {
      throw new BadRequestException("Friend request already pending");
    }
    if (sender.friendRequests.some((id: Types.ObjectId) => isSameId(id, recipientId))) {
      throw new BadRequestException("This user already sent you a friend request");
    }
    if (sender.sentRequests.some((id: Types.ObjectId) => isSameId(id, recipientId))) {
      throw new BadRequestException("Friend request already pending");
    }

    recipient.friendRequests.addToSet(sender._id);
    sender.sentRequests.addToSet(recipient._id);
    await Promise.all([recipient.save(), sender.save()]);

    return { message: "Friend request sent successfully" };
  };

  acceptFriendRequest = async (userId: string, senderId: string) => {
    this.validateId(senderId);
    const [user, sender] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(senderId)
    ]);
    if (!user || !sender) throw new NotFoundException("User not found");
    if (!user.friendRequests.some((id: Types.ObjectId) => isSameId(id, senderId))) {
      throw new BadRequestException("No pending friend request from this user");
    }

    user.friendRequests.pull(sender._id);
    user.friends.addToSet(sender._id);
    sender.sentRequests.pull(user._id);
    sender.friends.addToSet(user._id);
    await Promise.all([user.save(), sender.save()]);

    return { message: "Friend request accepted" };
  };

  rejectFriendRequest = async (userId: string, otherUserId: string) => {
    this.validateId(otherUserId);
    const [user, otherUser] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(otherUserId)
    ]);
    if (!user || !otherUser) throw new NotFoundException("User not found");

    const hasIncoming = user.friendRequests.some((id: Types.ObjectId) => isSameId(id, otherUserId));
    const hasOutgoing = user.sentRequests.some((id: Types.ObjectId) => isSameId(id, otherUserId));
    if (!hasIncoming && !hasOutgoing) {
      throw new BadRequestException("No pending friend request with this user");
    }

    user.friendRequests.pull(otherUser._id);
    user.sentRequests.pull(otherUser._id);
    otherUser.friendRequests.pull(user._id);
    otherUser.sentRequests.pull(user._id);
    await Promise.all([user.save(), otherUser.save()]);

    return { message: "Friend request removed" };
  };

  unfriend = async (userId: string, targetFriendId: string) => {
    this.validateId(targetFriendId);
    const [user, targetFriend] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(targetFriendId)
    ]);
    if (!user || !targetFriend) throw new NotFoundException("User not found");

    user.friends.pull(targetFriend._id);
    targetFriend.friends.pull(user._id);
    await Promise.all([user.save(), targetFriend.save()]);

    return { message: "Unfriended successfully" };
  };

  getPendingRequests = async (userId: string) => {
    const user = await UserModel.findById(userId)
      .populate("friendRequests", "firstName lastName profilePicture");
    if (!user) throw new NotFoundException("User not found");
    return user.friendRequests;
  };

  getSentRequests = async (userId: string) => {
    const user = await UserModel.findById(userId)
      .populate("sentRequests", "firstName lastName profilePicture");
    if (!user) throw new NotFoundException("User not found");
    return user.sentRequests;
  };

  getFriends = async (userId: string) => {
    this.validateId(userId);
    const user = await UserModel.findById(userId)
      .populate("friends", "firstName lastName profilePicture");
    if (!user) throw new NotFoundException("User not found");
    return user.friends;
  };

  getFriendStatus = async (userId: string, otherUserId: string) => {
    this.validateId(otherUserId);
    if (isSameId(userId, otherUserId)) return { status: "self" as const };

    const [user, otherUser] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(otherUserId)
    ]);
    if (!user || !otherUser) throw new NotFoundException("User not found");
    if (user.friends.some((id: Types.ObjectId) => isSameId(id, otherUserId))) return { status: "friends" as const };
    if (user.sentRequests.some((id: Types.ObjectId) => isSameId(id, otherUserId))) return { status: "request_sent" as const };
    if (user.friendRequests.some((id: Types.ObjectId) => isSameId(id, otherUserId))) return { status: "request_received" as const };
    return { status: "none" as const };
  };
}

export default new FriendService();
