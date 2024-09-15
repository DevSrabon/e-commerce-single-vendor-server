import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminSupplierService from "../adminService/admin.supplier.service";

class AdminSupplierController extends AdminAbstractController {
  private supplierService = new AdminSupplierService();

  constructor() {
    super();
  }

  // create a supplier
  public createSupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.createSupplier(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all supplier
  public getAllSupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.getSuppliers(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single supplier
  public getSingleSupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = await this.supplierService.getSingleSupplier(parseInt(id));
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update single supplier
  public updateSupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.updateSingleSupplier(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all supplier invoice
  public getAllSupplierInvoiceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.getAllSupplierInvoice(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single supplier invoice
  public getSingleSupplierInvoiceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.getSingleSupplierInvoice(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update supplier invoice
  public updateSupplierInvoiceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.updateSupplierInvoice(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // ================ ledger and report ==============//
  public getAllReportBySupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.getAllReportBySupplier(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  public getAllLedgerBySupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.supplierService.getAllLedgerBySupplier(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminSupplierController;
