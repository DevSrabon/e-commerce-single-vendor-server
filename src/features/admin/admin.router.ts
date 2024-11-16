import { Router } from "express";
import AdminAddressRouter from "./adminRouter/admin.address.router";
import AdminAuditTrailRouter from "./adminRouter/admin.audit-trail.router";
import AdminAuthRouter from "./adminRouter/admin.auth.router";
import AdminClientRouter from "./adminRouter/admin.client.router";
import AdminDamageProductRouter from "./adminRouter/admin.damage-product.router";
import AdminEcommerceRouter from "./adminRouter/admin.ecommerce.router";
import AdminProductRouter from "./adminRouter/admin.product.router";
import AdminRolePermissionRouter from "./adminRouter/admin.role-permission.router";
import AdminStaffRouter from "./adminRouter/admin.staff.router";
import AdminTransferProductRouter from "./adminRouter/admin.transfer-product.router";
import AdminWareHouseRouter from "./adminRouter/admin.warehouse.router";
// import AdminAccountsRouter from './adminRouter/admin.accounts.router';
import AdminAbstractRouter from "./adminAbstracts/admin.abstract.router";
import AdminColorRouter from "./adminRouter/admin.color.router";
import AdminCouponRouter from "./adminRouter/admin.coupon.controller";
import AdminCurrencyRouter from "./adminRouter/admin.currency.router";
import AdminDashboardRouter from "./adminRouter/admin.dashboard.router";
import AdminInventoryRouter from "./adminRouter/admin.inventory.router";
import AdminMailRouter from "./adminRouter/admin.mail.router";
import AdminNotificationRouter from "./adminRouter/admin.notification.router";
import AdminOfferRouter from "./adminRouter/admin.offer.router";
import AdminProfileRouter from "./adminRouter/admin.profile.router";
import AdminReportRouter from "./adminRouter/admin.report.router";
import AdminSaleInvoiceRouter from "./adminRouter/admin.sale-invoice.router";

class AdminRouter extends AdminAbstractRouter {
  public AdminRouter = Router();
  private adminAuthRouter = new AdminAuthRouter();
  private adminProfileRouter = new AdminProfileRouter();
  private adminProductRouter = new AdminProductRouter();
  private addressRouter = new AdminAddressRouter();
  private adminAttributeRouter = new AdminColorRouter();
  private adminStaffRouter = new AdminStaffRouter();
  private adminWareHouseRouter = new AdminWareHouseRouter();
  private adminClientRouter = new AdminClientRouter();
  private adminDamageProduct = new AdminDamageProductRouter();
  private adminEcommerce = new AdminEcommerceRouter();
  private adminTransferProduct = new AdminTransferProductRouter();
  private adminAuditTrail = new AdminAuditTrailRouter();
  private adminRolePermission = new AdminRolePermissionRouter();
  private adminInventory = new AdminInventoryRouter();
  private adminSaleInvoice = new AdminSaleInvoiceRouter();
  private adminReport = new AdminReportRouter();
  private adminOffer = new AdminOfferRouter();
  private adminMail = new AdminMailRouter();
  private adminCurrency = new AdminCurrencyRouter();
  private adminDashboardRouter = new AdminDashboardRouter();
  private adminCoupon = new AdminCouponRouter();
  private adminNotification = new AdminNotificationRouter();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.AdminRouter.use("/auth", this.adminAuthRouter.router);
    // ====== Admin Auth middleware =====
    this.AdminRouter.use(this.authChecker.authChecker);
    // =========================
    this.AdminRouter.use("/profile", this.adminProfileRouter.router);
    this.AdminRouter.use("/products", this.adminProductRouter.router);
    this.AdminRouter.use("/address", this.addressRouter.router);
    this.AdminRouter.use("/attribute", this.adminAttributeRouter.router);
    this.AdminRouter.use("/staff", this.adminStaffRouter.router);
    this.AdminRouter.use("/store", this.adminWareHouseRouter.router);
    this.AdminRouter.use("/client", this.adminClientRouter.router);
    this.AdminRouter.use("/damage-product", this.adminDamageProduct.router);
    this.AdminRouter.use("/ecommerce", this.adminEcommerce.eRouter);
    this.AdminRouter.use("/transfer", this.adminTransferProduct.router);
    this.AdminRouter.use("/audit-trail", this.adminAuditTrail.router);
    this.AdminRouter.use("/role-permission", this.adminRolePermission.router);
    this.AdminRouter.use("/inventory", this.adminInventory.router);
    this.AdminRouter.use("/sale-invoice", this.adminSaleInvoice.router);
    this.AdminRouter.use("/report", this.adminReport.reportRouter);
    this.AdminRouter.use("/offer", this.adminOffer.router);
    this.AdminRouter.use("/mail", this.adminMail.router);
    this.AdminRouter.use("/currency", this.adminCurrency.router);
    this.AdminRouter.use("/dashboard", this.adminDashboardRouter.router);
    this.AdminRouter.use("/coupon", this.adminCoupon.router);
    this.AdminRouter.use("/notification", this.adminNotification.router);
  }
}
export default AdminRouter;
