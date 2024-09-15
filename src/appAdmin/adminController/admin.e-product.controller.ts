import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminEcommerceProductService from "../adminService/admin.e-product.service";

class AdminEcommerceProductController extends AdminAbstractController {
  private eProductService = new AdminEcommerceProductService();
  constructor() {
    super();
  }

  // add product into ecommerce controller
  public addProductIntoEcommerceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eProductService.addProductIntoEcommerceService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // get all ecommerce product controller
  public getAllEcommerceProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eProductService.getAllEcommerceProductService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get a single ecommerce product controller
  public getSingleEcommerceProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eProductService.getSingleEcommerceProductService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update a ecommerce product controller
  public updateEcommerceProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eProductService.updateEcommerceProductService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );
}

export default AdminEcommerceProductController;
