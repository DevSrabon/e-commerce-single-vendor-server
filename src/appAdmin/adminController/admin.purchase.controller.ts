import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminPurchaseService from "../adminService/admin.purchase.service";

class AdminPurchaseController extends AdminAbstractController {
  private purchaseService = new AdminPurchaseService();

  constructor() {
    super();
  }

  // create a purchase
  public createPurchaseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.purchaseService.createPurchaseService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all purchase
  public getAllPurchaseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.purchaseService.getAllPurchaseProductService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get all purchase for report ledger
  public getAllPurchaseForReportLedgerController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data =
        await this.purchaseService.getAllPurchaseForReportLedgerService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get single purchase
  public getSinglePurchaseController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.purchaseService.getSinglePurchaseProductService(
        req
      );

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );
}

export default AdminPurchaseController;
