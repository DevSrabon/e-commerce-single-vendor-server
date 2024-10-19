import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminSaleInvoiceService from "../adminService/admin.sale-invoice.service";

class AdminSaleInvoiceController extends AdminAbstractController {
  private saleInvoiceService = new AdminSaleInvoiceService();
  constructor() {
    super();
  }

  // create sale invoice
  public createSaleInvoiceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.saleInvoiceService.createSaleInvoiceService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get sale invoice
  public getSaleInvoiceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.saleInvoiceService.getSaleInvoiceService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single sale invoice
  public getSingleSaleInvoiceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.saleInvoiceService.getSingleInvoiceService(req);
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
      const data = await this.saleInvoiceService.getSingleInventoryService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // update invoice remark
  public updateInvoiceRemarkController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.saleInvoiceService.updateSaleInvoiceRemark(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminSaleInvoiceController;
