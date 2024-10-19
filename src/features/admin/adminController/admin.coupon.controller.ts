import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminCouponService from "../adminService/admin.coupon.service";

class AdminCouponController extends AdminAbstractController {
  private service = new AdminCouponService();

  constructor() {
    super();
  }

  // Get all coupons
  public getAll = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAll(req);

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

  // Create a new coupon
  public createCoupon = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.createCoupon(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // Update coupon by ID
  public updateCoupon = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.updateSingle(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // Delete coupon by ID
  public deleteCoupon = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.delete(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminCouponController;
