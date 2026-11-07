import { Request, Response, Router } from "express";
import { responseFormatter, authenticate, ISecureRequest } from "../../Middlewares";
import notificationService from "./notification.service";

const notificationController = Router();

const parsePagination = (query: Request["query"]) => {
  const page = Number.parseInt(String(query.page), 10);
  const limit = Number.parseInt(String(query.limit), 10);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20,
  };
};

notificationController.get(
  "/",
  authenticate,
  responseFormatter(async (req: ISecureRequest, _res: Response) => {
    const { page, limit } = parsePagination(req.query);
    const result = await notificationService.getNotifications(req.user._id.toString(), page, limit);
    return {
      message: "Notifications fetched successfully",
      data: result.notifications,
      meta: {
        statusCode: 200,
        unreadCount: result.unreadCount,
        pagination: result.pagination,
      },
    };
  })
);

notificationController.patch(
  "/read-all",
  authenticate,
  responseFormatter(async (req: ISecureRequest, _res: Response) => {
    const result = await notificationService.markAllAsRead(req.user._id.toString());
    return { message: "Notifications marked as read", data: result, meta: { statusCode: 200 } };
  })
);

notificationController.patch(
  "/:id/read",
  authenticate,
  responseFormatter(async (req: ISecureRequest, _res: Response) => {
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await notificationService.markAsRead(notificationId, req.user._id.toString());
    return { message: "Notification marked as read", data: result, meta: { statusCode: 200 } };
  })
);

export default notificationController;
