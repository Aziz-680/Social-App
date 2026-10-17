import { Router, Response } from "express";
import friendService from "./friend.service";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";

const friendController = Router();

// Send Request
friendController.post(
  "/request/:recipientId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.sendFriendRequest(req.user._id.toString(), String(req.params.recipientId));
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Accept Request
friendController.post(
  "/accept/:senderId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.acceptFriendRequest(req.user._id.toString(), String(req.params.senderId));
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Reject/Cancel Request
friendController.post(
  "/reject/:senderId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.rejectFriendRequest(req.user._id.toString(), String(req.params.senderId));
    return { message: result.message, data: null, meta: { statusCode: 200 } };
  })
);

// Unfriend
friendController.delete(
  "/:friendId",
  authenticate,
  responseFormatter(async (req: ISecureRequest, res: Response) => {
    const result = await friendService.unfriend(req.user._id.toString(), String(req.params.friendId));
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

export default friendController;