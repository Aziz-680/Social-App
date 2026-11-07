import { Types } from "mongoose";
import NotificationModel from "../../DB/Models/notification.model";
import { BadRequestException, NotFoundException } from "../../Common/Utils/Errors/exceptions";

class NotificationService {
  createPostActivity = async (
    recipientId: string | Types.ObjectId,
    actorId: string | Types.ObjectId,
    postId: string | Types.ObjectId,
    type: "reaction" | "comment" | "share",
    details: { reactionType?: string; commentPreview?: string } = {}
  ) => {
    if (recipientId.toString() === actorId.toString()) return null;

    return NotificationModel.create({
      recipientId,
      actorId,
      postId,
      type,
      ...details,
    });
  };

  createMessageActivity = async (
    recipientId: string | Types.ObjectId,
    actorId: string | Types.ObjectId,
    conversationId: string | Types.ObjectId,
    messagePreview: string,
  ) => {
    if (recipientId.toString() === actorId.toString()) return null;
    return NotificationModel.create({
      recipientId,
      actorId,
      conversationId,
      type: "message",
      messagePreview: messagePreview.slice(0, 120),
    });
  };

  getNotifications = async (userId: string, page: number, limit: number) => {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException("Invalid user ID");
    const skip = (page - 1) * limit;
    const filter = { recipientId: userId };

    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actorId", "firstName lastName profilePicture status")
        .populate("postId", "content media userId isRepost originalPostId"),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({ ...filter, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  };

  markAsRead = async (notificationId: string, userId: string) => {
    if (!Types.ObjectId.isValid(notificationId)) throw new BadRequestException("Invalid notification ID");

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new NotFoundException("Notification not found");
    return notification;
  };

  markAllAsRead = async (userId: string) => {
    const result = await NotificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
    return { modifiedCount: result.modifiedCount };
  };
}

export default new NotificationService();
