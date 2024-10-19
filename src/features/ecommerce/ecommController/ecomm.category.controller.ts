import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommCategoryService from "../ecommService/ecomm.category.service";

class EcommCategoryController extends EcommAbstractController {
  private ecommCategory = new EcommCategoryService();
  constructor() {
    super();
  }

  // get category
  public getCategory = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommCategory.getCategory(req);
      res.status(200).json(data);
    }
  );
}
export default EcommCategoryController;
