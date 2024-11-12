import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommOrderService from "../ecommService/ecomm.order.service";

class EcommOrderController extends EcommAbstractController {
  private ecommOrderService = new EcommOrderService();
  constructor() {
    super();
  }

  // place order controller
  public placeOrderController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommOrderService.ecommPlaceOrderService(req);
      if (data.success && "redirect_url" in data) {
        res.redirect(data.redirect_url as string);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get order controller
  public getOrderService = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommOrderService.ecommGetOrderService(req);
      res.status(200).json(data);
    }
  );

  // get single order controller
  public geSingleOrderService = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommOrderService.getSingleOrderService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}
export default EcommOrderController;
