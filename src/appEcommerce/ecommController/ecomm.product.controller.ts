import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommProductService from "../ecommService/ecomm.product.service";

class EcommProductController extends EcommAbstractController {
  private ecommProductService = new EcommProductService();
  constructor() {
    super();
  }

  // get ecommerce product filter name, tags, category, short by limit skip
  public getEcommProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getEcommProductService(req);

      res.status(200).json(data);
    }
  );

  // get single ecommerce product
  public getSingleEcommProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { product } = req.params;
      const data = await this.ecommProductService.getEcommSingleProduct(
        product
      );

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default EcommProductController;
