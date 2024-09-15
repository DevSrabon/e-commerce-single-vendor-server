import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminInventoryService from "../adminService/admin.inventory.service";

class AdminInventoryController extends AdminAbstractController {
  private inventoryService = new AdminInventoryService();
  constructor() {
    super();
  }

  // get all inventory product
  public getAlInventoryController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.inventoryService.getAllInventoryService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single inventory product
  public getSingleInventoryController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.inventoryService.getSingleInventoryService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminInventoryController;
