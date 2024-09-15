import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminEcommerceReviewService from "../adminService/admin.e-review.service";

class AdminEcommerceReviewController extends AdminAbstractController {
  private eReviewService = new AdminEcommerceReviewService();
  constructor() {
    super();
  }

  // get all ecommerce review controller
  public getAllEreviewController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eReviewService.getAllEreviewService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get a single ecommerce review controller
  public getSingleEreviewController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eReviewService.getSingleEreviewService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminEcommerceReviewController;
