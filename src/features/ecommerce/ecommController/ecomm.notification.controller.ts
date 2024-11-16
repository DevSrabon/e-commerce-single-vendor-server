import { Request, Response } from "express";

import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommNotificationService from "../ecommService/ecomm.notification.service";

class EcommNotificationController extends EcommAbstractController {
  private service = new EcommNotificationService();

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

export default EcommNotificationController;
