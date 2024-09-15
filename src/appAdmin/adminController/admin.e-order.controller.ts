import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminEcommerceOrderService from "../adminService/admin.e-order.service";

class AdminEcommerceOrderController extends AdminAbstractController {
  private eOrderService = new AdminEcommerceOrderService();
  constructor() {
    super();
  }

  // get all ecommerce order controller
  public getAllEorderController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eOrderService.getAllEorderService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get a single ecommerce order controller
  public getSingleEorderController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eOrderService.getSingleEorderService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // update single ecommerce order
  public updateSingleEorderPaymentController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eOrderService.updateSingleEorderPaymentService(
        req
      );
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // update order tracking
  public updateSingleEorderTrackingController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eOrderService.updateSingleEorderTrackingService(
        req
      );
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminEcommerceOrderController;
