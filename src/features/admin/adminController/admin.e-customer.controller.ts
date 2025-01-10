import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminEcustomerService from "../adminService/admin.e-customer.service";

class AdminEcustomerController extends AdminAbstractController {
  private eCustomerService = new AdminEcustomerService();
  constructor() {
    super();
  }

  // get all ecommerce customer controller
  public getAllEcustomerController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eCustomerService.getAllEcustomerService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get a single ecommerce customer controller
  public getSingleEcustomerController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eCustomerService.getSingleEcustomerService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
  public getAllNewsLetter = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.eCustomerService.getAllNewsLetter(
        req
      );
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminEcustomerController;
