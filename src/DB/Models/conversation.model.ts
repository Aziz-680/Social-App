import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  participantKey: string;
  lastMessage?: Types.ObjectId | null;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
      required: true,
      validate: {
        validator: (participants: Types.ObjectId[]) => participants.length === 2,
        message: "A direct conversation must have exactly two participants",
      },
    },
    participantKey: { type: String, required: true, unique: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const ConversationModel = mongoose.models.Conversation
  || mongoose.model<IConversation>("Conversation", conversationSchema);

export default ConversationModel;