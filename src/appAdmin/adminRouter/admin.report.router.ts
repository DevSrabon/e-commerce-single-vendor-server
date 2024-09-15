import { Router } from 'express';
import AdminAccountsRouter from './admin.accounts.router';
import AdminPurchaseRouter from './admin.purchase.router';
import AdminSupplierRouter from './admin.supplier.router';

class AdminReportRouter {
  public reportRouter = Router();
  private adminAccounts = new AdminAccountsRouter();
  private adminPurchase = new AdminPurchaseRouter();
  private adminSupplier = new AdminSupplierRouter();

  constructor() {
    this.callrouter();
  }
  private callrouter() {
    this.reportRouter.use('/accounts', this.adminAccounts.router);
    this.reportRouter.use('/purchase', this.adminPurchase.router);
    this.reportRouter.use('/supplier', this.adminSupplier.router);
  }
}

export default AdminReportRouter;
