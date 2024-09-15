import { Request, Response } from "express";
import AbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminAccountsService from "../adminService/admin.accounts.service";

class AdminAccountsController extends AbstractController {
  private accountService = new AdminAccountsService();

  constructor() {
    super();
  }

  // create a account
  public createAccountController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.accountService.createAccountService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all account
  public getAllaccountController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.accountService.getAllaccountService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single account
  public getSingleAccountController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.accountService.getSingleAccountService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // update single account
  public updateSingleAccountController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.accountService.updateSingleAccountService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all transaction
  public getAllTransactionController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.accountService.getAllTransactionService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get all ledger by account
  public getAllLedgerByAccountController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.accountService.getAllLedgerByAccountService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminAccountsController;
