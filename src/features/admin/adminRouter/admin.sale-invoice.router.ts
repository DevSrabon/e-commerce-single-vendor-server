import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminSaleInvoiceController from "../adminController/admin.sale-invoice.controller";

class AdminSaleInvoiceRouter extends AdminAbstractRouter {
  private saleInvoiceController = new AdminSaleInvoiceController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create sale invoice
    this.router
      .route("/")
      .post(
        this.adminInputValidator.saleValidator(),
        this.saleInvoiceController.createSaleInvoiceController
      )
      .get(this.saleInvoiceController.getSaleInvoiceController);

    // get single invoice
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid invoice id"
        ),
        this.saleInvoiceController.getSingleSaleInvoiceController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid invoice id"
        ),
        this.saleInvoiceController.updateInvoiceRemarkController
      );

    // get single inventory product
    this.router
      .route("/warehouse-inventory/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid inventory id"
        ),
        this.saleInvoiceController.getSingleInventoryController
      );
  }
}

export default AdminSaleInvoiceRouter;
