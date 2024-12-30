import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommCouponService from "../ecommService/ecomm.coupon.service";

class EccomCouponController extends EcommAbstractController {
  private service = new EcommCouponService();

  constructor() {
    super();
  }

  // Get coupons
  public getCoupon = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getCoupon(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Get single coupon by ID
  public getSingle = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getSingle(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default EccomCouponController;
