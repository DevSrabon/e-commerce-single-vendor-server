import AdminProductRouter from './adminRouter/admin.product.router';
import AdminAddressRouter from './adminRouter/admin.address.router';
import AdminAuthRouter from './adminRouter/admin.auth.router';
import { Router } from 'express';
import AdminAttributeRouter from './adminRouter/admin.attribute.router';
import AdminStaffRouter from './adminRouter/admin.staff.router';
import AdminWareHouseRouter from './adminRouter/admin.warehouse.router';
import AdminClientRouter from './adminRouter/admin.client.router';
import AdminSupplierRouter from './adminRouter/admin.supplier.router';
import AdminDamageProductRouter from './adminRouter/admin.damage-product.router';
import AdminEcommerceRouter from './adminRouter/admin.ecommerce.router';
import AdminTransferProductRouter from './adminRouter/admin.transfer-product.router';
import AdminAuditTrailRouter from './adminRouter/admin.audit-trail.router';
import AdminRolePermissionRouter from './adminRouter/admin.role-permission.router';
import AdminPurchaseRouter from './adminRouter/admin.purchase.router';
// import AdminAccountsRouter from './adminRouter/admin.accounts.router';
import AdminInventoryRouter from './adminRouter/admin.inventory.router';
import AdminReportRouter from './adminRouter/admin.report.router';
import AdminProfileRouter from './adminRouter/admin.profile.router';
import AdminSaleInvoiceRouter from './adminRouter/admin.sale-invoice.router';

class AdminRouter {
  public AdminRouter = Router();
  private adminAuthRouter = new AdminAuthRouter();
  private adminProfileRouter = new AdminProfileRouter();
  private adminProductRouter = new AdminProductRouter();
  private addressRouter = new AdminAddressRouter();
  private adminAttributeRouter = new AdminAttributeRouter();
  private adminStaffRouter = new AdminStaffRouter();
  private adminWareHouseRouter = new AdminWareHouseRouter();
  private adminClientRouter = new AdminClientRouter();
  private adminSupplierRouter = new AdminSupplierRouter();
  private adminDamageProduct = new AdminDamageProductRouter();
  private adminEcommerce = new AdminEcommerceRouter();
  private adminTransferProduct = new AdminTransferProductRouter();
  private adminAuditTrail = new AdminAuditTrailRouter();
  private adminRolePermission = new AdminRolePermissionRouter();
  private adminPurchase = new AdminPurchaseRouter();
  private adminInventory = new AdminInventoryRouter();
  private adminSaleInvoice = new AdminSaleInvoiceRouter();
  private adminReport = new AdminReportRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.AdminRouter.use('/auth', this.adminAuthRouter.router);
    this.AdminRouter.use('/profile', this.adminProfileRouter.router);
    this.AdminRouter.use('/products', this.adminProductRouter.router);
    this.AdminRouter.use('/address', this.addressRouter.router);
    this.AdminRouter.use('/attribute', this.adminAttributeRouter.router);
    this.AdminRouter.use('/staff', this.adminStaffRouter.router);
    this.AdminRouter.use('/warehouse', this.adminWareHouseRouter.router);
    this.AdminRouter.use('/client', this.adminClientRouter.router);
    this.AdminRouter.use('/supplier', this.adminSupplierRouter.router);
    this.AdminRouter.use('/damage-product', this.adminDamageProduct.router);
    this.AdminRouter.use('/ecommerce', this.adminEcommerce.eRouter);
    this.AdminRouter.use('/transfer', this.adminTransferProduct.router);
    this.AdminRouter.use('/audit-trail', this.adminAuditTrail.router);
    this.AdminRouter.use('/role-permission', this.adminRolePermission.router);
    this.AdminRouter.use('/purchase', this.adminPurchase.router);
    this.AdminRouter.use('/inventory', this.adminInventory.router);
    this.AdminRouter.use('/sale-invoice', this.adminSaleInvoice.router);
    this.AdminRouter.use('/report', this.adminReport.reportRouter);
  }
}
export default AdminRouter;
