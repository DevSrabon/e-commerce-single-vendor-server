import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminWareHouseService from "../adminService/admin.warehouse.service";

class AdminWareHouseController extends AdminAbstractController {
  private warehouseService = new AdminWareHouseService();

  constructor() {
    super();
  }

  // create a warehouse
  public createWarehouseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.warehouseService.createWarehouseService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all warehouse
  public getAllWarehouseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.warehouseService.getAllWarehouseService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single warehouse
  public getSingleWarehouseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.warehouseService.getSingleWarehouseService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update warehouse
  public updateWarehouseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.warehouseService.updateWarehouseService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );
}

export default AdminWareHouseController;
