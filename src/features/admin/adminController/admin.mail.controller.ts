import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminMailService from "../adminService/admin.mail.service";

class AdminMailController extends AdminAbstractController {
  private mailService = new AdminMailService();

  constructor() {
    super();
  }

  // Get all mails
  public getAllMails = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.mailService.getAllMailService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Get mail by ID
  public getSingleMail = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.mailService.getMailByIdService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Delete mail by ID
  public deleteMail = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.mailService.deleteMailService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Delete all mails
  public deleteAllMails = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.mailService.deleteAllMailService();

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminMailController;
