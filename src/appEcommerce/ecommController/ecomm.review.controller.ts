import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommReviewService from "../ecommService/ecomm.review.service";

class EcommReviewController extends EcommAbstractController {
  private ecommReviewService = new EcommReviewService();
  constructor() {
    super();
  }

  // create review controller
  public createReviewController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommReviewService.createReviewService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get review of a product controller
  public getReviewOfProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = await this.ecommReviewService.getReviewOfProductService(id);

      res.status(200).json(data);
    }
  );

  // get review of customer
  public getReviewOfCustomerController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { ec_id } = req.customer;
      const data = await this.ecommReviewService.getReviewOfCustomerService(
        ec_id
      );
      res.status(200).json(data);
    }
  );

  // delete review
  public deleteReviewController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { ec_id } = req.customer;
      const data = await this.ecommReviewService.deleteReviewService(id, ec_id);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get to review products controller
  public getToReviewProductsController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { ec_id } = req.customer;
      const data = await this.ecommReviewService.getToReviewProduct(ec_id);

      res.status(200).json(data);
    }
  );
}
export default EcommReviewController;
