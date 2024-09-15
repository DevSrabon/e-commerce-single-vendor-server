import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminDamageProductService from "../adminService/admin.damage-product.service";

class AdminDamageProductController extends AdminAbstractController {
  private damageProductService = new AdminDamageProductService();
  constructor() {
    super();
  }

  // add damage product controller
  public addDamageProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.damageProductService.addDamageProductService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all damage product controller
  public getAllDamageProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.damageProductService.getAllDamageProductService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get a single damage product controller
  public getSingleDamageProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data =
        await this.damageProductService.getSingleDamageProductService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update a damage product controller
  public updateDamageProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.damageProductService.updateDamageProductService(
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

export default AdminDamageProductController;
