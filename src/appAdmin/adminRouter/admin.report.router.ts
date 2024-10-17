import { Router } from "express";
import AdminAccountsRouter from "./admin.accounts.router";

class AdminReportRouter {
  public reportRouter = Router();
  private adminAccounts = new AdminAccountsRouter();

  constructor() {
    this.callRouter();
  }
  private callRouter() {
    this.reportRouter.use("/accounts", this.adminAccounts.router);
  }
}

export default AdminReportRouter;
