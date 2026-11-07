import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  attachments: Array<{
    url: string;
    name: string;
    mimeType: string;
    size: number;
  }>;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, trim: true, maxlength: 2000, default: "" },
    attachments: {
      type: [{
        url: { type: String, required: true },
        name: { type: String, required: true, maxlength: 255 },
        mimeType: { type: String, required: true, maxlength: 120 },
        size: { type: Number, required: true, max: 10 * 1024 * 1024 },
      }],
      default: [],
      validate: { validator: (attachments: unknown[]) => attachments.length <= 1, message: "A message can contain one attachment" },
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, senderId: 1, readAt: 1 });

const MessageModel = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default MessageModel;