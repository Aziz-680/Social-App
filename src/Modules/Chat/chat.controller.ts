import { Request, Response, Router } from "express";
import { authenticate, ISecureRequest, responseFormatter } from "../../Middlewares";
import { BadRequestException } from "../../Common/Utils/Errors/exceptions";
import chatService from "./chat.service";
import { publishChatMessage } from "./chat.socket";
import { uploadChatAttachment } from "../../Middlewares/upload.middleware";

const chatController = Router();

const getPagination = (query: Request["query"]) => {
  const requestedPage = Number.parseInt(String(query.page ?? "1"), 10);
  const requestedLimit = Number.parseInt(String(query.limit ?? "30"), 10);
  return {
    page: Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    limit: Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 30,
  };
};

chatController.post(
  "/conversations",
  authenticate,
  responseFormatter(async (req: ISecureRequest) => {
    const recipientId = req.body?.recipientId;
    if (typeof recipientId !== "string") {
      throw new BadRequestException("recipientId is required");
    }
    const conversation = await chatService.createOrGetConversation(req.user._id.toString(), recipientId);
    return {
      message: "Conversation ready",
      data: conversation,
      meta: { statusCode: 200 },
    };
  }),
);

chatController.get(
  "/conversations",
  authenticate,
  responseFormatter(async (req: ISecureRequest) => {
    const { page, limit } = getPagination(req.query);
    const result = await chatService.listConversations(req.user._id.toString(), page, limit);
    return {
      message: "Conversations fetched successfully",
      data: result.conversations,
      meta: { statusCode: 200, pagination: result.pagination },
    };
  }),
);

chatController.get(
  "/conversations/:conversationId/messages",
  authenticate,
  responseFormatter(async (req: ISecureRequest) => {
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    const before = typeof req.query.before === "string" ? req.query.before : undefined;
    const requestedLimit = Number.parseInt(String(req.query.limit ?? "30"), 10);
    const result = await chatService.getMessages(
      req.user._id.toString(),
      conversationId,
      before,
      Number.isFinite(requestedLimit) ? requestedLimit : 30,
    );
    return {
      message: "Messages fetched successfully",
      data: result.messages,
      meta: { statusCode: 200, hasMore: result.hasMore, nextBefore: result.nextBefore },
    };
  }),
);

chatController.post(
  "/conversations/:conversationId/messages",
  authenticate,
  uploadChatAttachment.single("attachment"),
  responseFormatter(async (req: ISecureRequest, _res: Response) => {
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    if (req.body?.text !== undefined && typeof req.body.text !== "string") {
      throw new BadRequestException("text must be a string");
    }
    const uploaded = req.file as Express.Multer.File | undefined;
    const attachment = uploaded ? {
      url: uploaded.path,
      name: uploaded.originalname.slice(0, 255),
      mimeType: uploaded.mimetype,
      size: uploaded.size,
    } : undefined;
    const message = await chatService.sendMessage(
      req.user._id.toString(),
      conversationId,
      req.body?.text ?? "",
      attachment,
    );
    await publishChatMessage(message);
    return { message: "Message sent", data: message, meta: { statusCode: 201 } };
  }),
);

chatController.post(
  "/conversations/:conversationId/read",
  authenticate,
  responseFormatter(async (req: ISecureRequest) => {
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    const receipt = await chatService.markConversationRead(req.user._id.toString(), conversationId);
    return { message: "Conversation marked as read", data: receipt, meta: { statusCode: 200 } };
  }),
);

export default chatController;