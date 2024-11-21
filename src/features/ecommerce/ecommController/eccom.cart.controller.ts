import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommCartService from "../ecommService/ecomm.cart.service";

class EcommCartController extends EcommAbstractController {
  private service = new EcommCartService();
  constructor() {
    super();
  }

  // Add to cart controller
  public addToCart = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.addToCart(req);
      if (data!.success) {
        res.json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // Remove from cart controller
  public removeFromCart = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.removeFromCart(req);
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
}
export default EcommCartController;
