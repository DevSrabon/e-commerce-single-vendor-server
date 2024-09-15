import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminTransferProductService from "../adminService/admin.transfer-product.service";

class AdminTransferProductController extends AdminAbstractController {
  private transferProductService = new AdminTransferProductService();
  constructor() {
    super();
  }

  // get all transfer list controller
  public getAllTransferListController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.transferProductService.getAllTransferListService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  public getSingleTransferController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.transferProductService.getSingleTransferService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        // this.error(data.message, 403);
        res.status(400).json(data);
      }
    }
  );

  // add transfer product controller
  public transferProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.transferProductService.transferProductService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get a single transfer product controller
  public getSingleTransferProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data =
        await this.transferProductService.getSingleTransferProductService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all transfer product controller
  public getAllTransferProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data =
        await this.transferProductService.getAllTransferProductService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // update a transfer controller
  public updateTransferController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.transferProductService.updateTransferService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );
}

export default AdminTransferProductController;
