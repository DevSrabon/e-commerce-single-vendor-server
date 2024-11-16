import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminNotificationService from "../adminService/admin.notification.service";

class AdminNotificationController extends AdminAbstractController {
  private service = new AdminNotificationService();

  constructor() {
    super();
  }

  // Get all notifications
  public getAllNotifications = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAllNotificationService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Delete notification by ID
  public updateNotification = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.updateNotificationService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Delete all notifications
  public deleteAllNotifications = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.deleteAllNotificationService();

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminNotificationController;
