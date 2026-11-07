import mongoose, { Schema } from "mongoose";
import { INotification } from "../../Common/Types/interface.types";

const notificationSchema = new Schema<INotification>({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  actorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  type: {
    type: String,
    enum: ["reaction", "comment", "share"],
    required: true,
  },
  reactionType: {
    type: String,
    enum: ["like", "love", "haha", "wow", "sad", "angry"],
  },
  commentPreview: {
    type: String,
    maxlength: 120,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

const NotificationModel = mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default NotificationModel;
