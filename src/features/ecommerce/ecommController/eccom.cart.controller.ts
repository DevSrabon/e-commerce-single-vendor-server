import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommCartService from "../ecommService/ecomm.cart.service";

class EcommCartController extends EcommAbstractController {
  private service = new EcommCartService();
  constructor() {
    super();
  }

  // place order controller
  public addToCart = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.addToCart(req);
      if (data.success) {
        res.json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  //   get All Carts
  public getAllCarts = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAllCarts(req);
      if (data.success) {
        res.json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get order controller
  //   public getOrderService = this.asyncWrapper.wrap(
  //     async (req: Request, res: Response) => {
  //       const data = await this.service.ecommGetOrderService(req);
  //       res.status(200).json(data);
  //     }
  //   );

  //   // get single order controller
  //   public geSingleOrderService = this.asyncWrapper.wrap(
  //     async (req: Request, res: Response) => {
  //       const data = await this.service.getSingleOrderService(req);
  //       if (data.success) {
  //         res.status(200).json(data);
  //       } else {
  //         res.status(404).json(data);
  //       }
  //     }
  //   );
}
export default EcommCartController;
