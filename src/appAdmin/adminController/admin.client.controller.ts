import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminClientService from "../adminService/admin.client.service";

class AdminClientController extends AdminAbstractController {
  private clientService = new AdminClientService();

  constructor() {
    super();
  }

  // create a client
  public createClientController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.clientService.createClientService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // get all client
  public getAllClientController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.clientService.getAllClientService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single client
  public getSingleClientController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.clientService.getSingleClientService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update client
  public updateClientController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.clientService.updateClientService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );
}

export default AdminClientController;
