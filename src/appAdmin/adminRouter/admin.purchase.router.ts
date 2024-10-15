import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminPurchaseController from "../adminController/admin.purchase.controller";

class AdminPurchaseRouter extends AdminAbstractRouter {
  private purchaseController = new AdminPurchaseController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // purchase and get all purchase
    this.router
      .route("/")
      .post(
        this.adminInputValidator.purchaseValidator(),
        this.purchaseController.createPurchaseController
      )
      .get(this.purchaseController.getAllPurchaseController);

    // get all purchase for report
    this.router
      .route("/ledger")
      .get(this.purchaseController.getAllPurchaseForReportLedgerController);

    // end report part

    // get single purchase
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide purchase id"
        ),
        this.purchaseController.getSinglePurchaseController
      );
  }
}

export default AdminPurchaseRouter;
