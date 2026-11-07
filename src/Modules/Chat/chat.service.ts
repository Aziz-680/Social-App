import { Types } from "mongoose";
import { BadRequestException, NotFoundException } from "../../Common/Utils/Errors/exceptions";
import ConversationModel from "../../DB/Models/conversation.model";
import MessageModel from "../../DB/Models/message.model";
import UserModel from "../../DB/Models/user.model";
import notificationService from "../Notification/notification.service";
import NotificationModel from "../../DB/Models/notification.model";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_SIZE = 100;

class ChatService {
  private getParticipantKey(userId: string, recipientId: string) {
    return [userId, recipientId].sort().join(":");
  }

  private validateObjectId(id: string, label: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
  }

  private async getParticipantConversation(conversationId: string, userId: string) {
    this.validateObjectId(conversationId, "conversation ID");
    const conversation = await ConversationModel.findOne({
      _id: conversationId,
      participants: userId,
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }

  createOrGetConversation = async (userId: string, recipientId: string) => {
    this.validateObjectId(userId, "user ID");
    this.validateObjectId(recipientId, "recipient ID");
    if (userId === recipientId) {
      throw new BadRequestException("You cannot start a conversation with yourself");
    }
    const recipientExists = await UserModel.exists({ _id: recipientId });
    if (!recipientExists) throw new NotFoundException("Recipient user not found");

    const participantKey = this.getParticipantKey(userId, recipientId);
    const participants = participantKey.split(":");
    try {
      const conversation = await ConversationModel.findOneAndUpdate(
        { participantKey },
        { $setOnInsert: { participantKey, participants } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).populate("participants", "firstName lastName profilePicture status");
      return conversation;
    } catch (error) {
      // Another request may win the unique-key upsert race; return its conversation.
      if ((error as { code?: number }).code === 11000) {
        return ConversationModel.findOne({ participantKey })
          .populate("participants", "firstName lastName profilePicture status");
      }
      throw error;
    }
  };

  listConversations = async (userId: string, page: number, limit: number) => {
    this.validateObjectId(userId, "user ID");
    const skip = (page - 1) * limit;
    const filter = { participants: userId };
    const [conversations, total] = await Promise.all([
      ConversationModel.find(filter)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "firstName lastName profilePicture status")
        .populate({
          path: "lastMessage",
          populate: { path: "senderId", select: "firstName lastName profilePicture status" },
        }),
      ConversationModel.countDocuments(filter),
    ]);

    const items = await Promise.all(conversations.map(async (conversation) => {
      const unreadCount = await MessageModel.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        readAt: null,
      });
      return { ...conversation.toObject(), unreadCount };
    }));

    return {
      conversations: items,
      pagination: { totalItems: total, currentPage: page, totalPages: Math.ceil(total / limit), limit },
    };
  };

  getMessages = async (userId: string, conversationId: string, before: string | undefined, requestedLimit: number) => {
    const conversation = await this.getParticipantConversation(conversationId, userId);
    const limit = Math.max(1, Math.min(requestedLimit || 30, MAX_PAGE_SIZE));
    const filter: Record<string, unknown> = { conversationId: conversation._id };
    if (before) {
      const beforeDate = new Date(before);
      if (Number.isNaN(beforeDate.getTime())) throw new BadRequestException("Invalid before cursor");
      filter.createdAt = { $lt: beforeDate };
    }

    const results = await MessageModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate("senderId", "firstName lastName profilePicture status");
    const hasMore = results.length > limit;
    const messages = results.slice(0, limit).reverse();
    return {
      messages,
      hasMore,
      nextBefore: hasMore && messages.length ? messages[0].createdAt.toISOString() : null,
    };
  };

  sendMessage = async (
    userId: string,
    conversationId: string,
    text: string,
    attachment?: { url: string; name: string; mimeType: string; size: number },
  ) => {
    const normalizedText = text.trim();
    if (!normalizedText && !attachment) throw new BadRequestException("Write a message or attach a file");
    if (normalizedText.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
    }

    const conversation = await this.getParticipantConversation(conversationId, userId);
    const message = await MessageModel.create({
      conversationId: conversation._id,
      senderId: userId,
      text: normalizedText,
      attachments: attachment ? [attachment] : [],
    });
    await ConversationModel.updateOne(
      { _id: conversation._id },
      { $set: { lastMessage: message._id, lastMessageAt: message.createdAt } },
    );
    const recipientId = conversation.participants.find((participant: Types.ObjectId) => participant.toString() !== userId);
    if (recipientId) {
      try {
        await notificationService.createMessageActivity(
          recipientId,
          userId,
          conversation._id,
          normalizedText || attachment?.name || "Sent an attachment",
        );
      } catch (error) {
        console.error("Could not save chat activity notification:", error);
      }
    }
    await message.populate("senderId", "firstName lastName profilePicture status");
    return message;
  };

  markConversationRead = async (userId: string, conversationId: string) => {
    const conversation = await this.getParticipantConversation(conversationId, userId);
    const readAt = new Date();
    const result = await MessageModel.updateMany(
      { conversationId: conversation._id, senderId: { $ne: userId }, readAt: null },
      { $set: { readAt } },
    );
    await NotificationModel.updateMany(
      { recipientId: userId, conversationId: conversation._id, type: "message", isRead: false },
      { $set: { isRead: true } },
    );
    return { conversationId, userId, readAt, modifiedCount: result.modifiedCount };
  };

  assertParticipant = async (userId: string, conversationId: string) => {
    await this.getParticipantConversation(conversationId, userId);
  };
}

export default new ChatService();