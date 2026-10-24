import { Router, Response } from "express";
import friendService from "./friend.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";

const friendController = Router();

const parseId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// Current user's friends
friendController.get(
  "/",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.getFriends(req.user._id.toString());
    return { message: "Friends fetched", data: result, meta: { statusCode: 200 } };
  })
);

// Send Request
friendController.post(
  "/request/:recipientId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const recipientId = parseId(req.params.recipientId);
    const result = await friendService.sendFriendRequest(req.user._id.toString(), recipientId);
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Accept Request
friendController.post(
  "/accept/:senderId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const senderId = parseId(req.params.senderId);
    const result = await friendService.acceptFriendRequest(req.user._id.toString(), senderId);
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Reject/Cancel Request
friendController.post(
  "/reject/:senderId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const senderId = parseId(req.params.senderId);
    const result = await friendService.rejectFriendRequest(req.user._id.toString(), senderId);
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Unfriend
friendController.delete(
  "/:friendId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const friendId = parseId(req.params.friendId);
    const result = await friendService.unfriend(req.user._id.toString(), friendId);
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Fetch Pending Requests
friendController.get(
  "/requests",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.getPendingRequests(req.user._id.toString());
    return { message: "Pending requests fetched", data: result, meta: { statusCode: 200 } };
  })
);

// Fetch outgoing requests
friendController.get(
  "/sent-requests",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.getSentRequests(req.user._id.toString());
    return { message: "Sent requests fetched", data: result, meta: { statusCode: 200 } };
  })
);

// Friendship status for the current user and a profile
friendController.get(
  "/status/:userId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.getFriendStatus(
      req.user._id.toString(),
      String(req.params.userId)
    );
    return { message: "Friend status fetched", data: result, meta: { statusCode: 200 } };
  })
);

// Friends for a profile
friendController.get(
  "/list/:userId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.getFriends(String(req.params.userId));
    return { message: "Friends fetched", data: result, meta: { statusCode: 200 } };
  })
);

export default friendController;