import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import TokenService from "../../Common/Services/token.service";
import ConversationModel from "../../DB/Models/conversation.model";
import type { IMessage } from "../../DB/Models/message.model";
import chatService from "./chat.service";
import { envConfig } from "../../config";
import { TooManyRequestsException } from "../../Common/Utils/Errors/exceptions";

interface AuthenticatedSocket extends Socket {
  data: { userId?: string };
}

type SocketAck = (result: { success: boolean; message?: string; data?: unknown }) => void;

let chatIO: Server | undefined;

const conversationRoom = (id: string) => `conversation:${id}`;
const userRoom = (id: string) => `user:${id}`;

const acknowledgeSocketError = (ack: SocketAck | undefined, error: unknown) => {
  const statusCode = Number((error as { statusCode?: number })?.statusCode);
  if (!Number.isInteger(statusCode) || statusCode >= 500) {
    console.error("Chat socket operation failed:", error);
    ack?.({ success: false, message: "Request failed" });
    return;
  }
  ack?.({ success: false, message: (error as Error).message });
};

const readCookieToken = (cookieHeader?: string) => {
  const tokenCookie = cookieHeader?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith("token="));
  if (!tokenCookie) return undefined;
  try {
    return decodeURIComponent(tokenCookie.slice("token=".length));
  } catch {
    return undefined;
  }
};

export const initializeChatSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: envConfig.app.corsOrigins, credentials: true },
  });
  chatIO = io;

  io.use((socket, next) => {
    void (async () => {
      const authToken = socket.handshake.auth?.token;
      const token = typeof authToken === "string" && authToken.length > 0
        ? authToken
        : readCookieToken(socket.handshake.headers.cookie);
      if (!token) throw new Error("Authentication required");

      const decoded = await TokenService.decodeToken({ token, tokenType: "ACCESS" });
      (socket as AuthenticatedSocket).data.userId = decoded.user._id.toString();
    })()
      .then(() => next())
      .catch(() => next(new Error("Unauthorized")));
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const userId = socket.data.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    void socket.join(userRoom(userId));
    let sendWindowStartedAt = Date.now();
    let sentMessagesInWindow = 0;

    socket.on("chat:join", (payload: { conversationId?: unknown }, ack?: SocketAck) => {
      void (async () => {
        if (typeof payload?.conversationId !== "string") throw new Error("conversationId is required");
        await chatService.assertParticipant(userId, payload.conversationId);
        await socket.join(conversationRoom(payload.conversationId));
        ack?.({ success: true, data: { conversationId: payload.conversationId } });
      })().catch((error: unknown) => acknowledgeSocketError(ack, error));
    });

    socket.on("chat:send", (payload: { conversationId?: unknown; text?: unknown }, ack?: SocketAck) => {
      void (async () => {
        const now = Date.now();
        if (now - sendWindowStartedAt >= 10_000) {
          sendWindowStartedAt = now;
          sentMessagesInWindow = 0;
        }
        if (sentMessagesInWindow >= 20) {
          throw new TooManyRequestsException("Too many messages. Try again shortly.");
        }
        sentMessagesInWindow += 1;
        if (typeof payload?.conversationId !== "string" || typeof payload?.text !== "string") {
          throw new Error("conversationId and text are required");
        }
        const message = await chatService.sendMessage(userId, payload.conversationId, payload.text);
        await socket.join(conversationRoom(payload.conversationId));
        await publishChatMessage(message);
        ack?.({ success: true, data: message });
      })().catch((error: unknown) => acknowledgeSocketError(ack, error));
    });

    socket.on("chat:typing", (payload: { conversationId?: unknown; isTyping?: unknown }, ack?: SocketAck) => {
      void (async () => {
        if (typeof payload?.conversationId !== "string" || typeof payload.isTyping !== "boolean") {
          throw new Error("conversationId and isTyping are required");
        }
        await chatService.assertParticipant(userId, payload.conversationId);
        await socket.join(conversationRoom(payload.conversationId));
        socket.to(conversationRoom(payload.conversationId)).emit("chat:typing", {
          conversationId: payload.conversationId,
          userId,
          isTyping: payload.isTyping,
        });
        ack?.({ success: true });
      })().catch((error: unknown) => acknowledgeSocketError(ack, error));
    });

    socket.on("chat:read", (payload: { conversationId?: unknown }, ack?: SocketAck) => {
      void (async () => {
        if (typeof payload?.conversationId !== "string") throw new Error("conversationId is required");
        const receipt = await chatService.markConversationRead(userId, payload.conversationId);
        await socket.join(conversationRoom(payload.conversationId));
        io.to(conversationRoom(payload.conversationId)).emit("chat:read", receipt);
        ack?.({ success: true, data: receipt });
      })().catch((error: unknown) => acknowledgeSocketError(ack, error));
    });
  });

  return io;
};

export const publishChatMessage = async (message: IMessage) => {
  if (!chatIO) return;
  const messageData = message.toObject();
  const conversationId = message.conversationId.toString();
  chatIO.to(conversationRoom(conversationId)).emit("chat:message", messageData);

  const conversation = await ConversationModel.findById(conversationId).select("participants");
  const recipientIds = conversation?.participants
    .map((participant: { toString(): string }) => participant.toString())
    .filter((participantId: string) => {
      const sender = message.senderId as unknown as { _id?: { toString(): string }; toString(): string };
      return participantId !== (sender._id?.toString() ?? sender.toString());
    }) ?? [];
  for (const recipientId of recipientIds) {
    chatIO.to(userRoom(recipientId)).emit("chat:inbox:new-message", messageData);
  }
};