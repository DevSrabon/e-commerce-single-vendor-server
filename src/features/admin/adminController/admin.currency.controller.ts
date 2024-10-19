import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminCurrencyService from "../adminService/admin.currency.service";

class AdminCurrencyController extends AdminAbstractController {
  constructor() {
    super();
  }
  private service = new AdminCurrencyService();

  // Create a currency
  public createCurrency = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.createCurrency(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // Get all currencies
  public getAllCurrencies = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAllCurrencies(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // Get a single currency by ID
  public getCurrencyById = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getCurrencyById(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 404);
      }
    }
  );

  // Update a single currency
  public updateCurrency = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.updateCurrency(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // Delete a single currency
  public deleteCurrency = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.deleteCurrency(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 404);
      }
    }
  );
}

export default AdminCurrencyController;
