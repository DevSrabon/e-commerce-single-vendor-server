import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminEcustomerController from "../adminController/admin.e-customer.controller";

class AdminEcustomerRouter extends AdminAbstractRouter {
  private eCustomerController = new AdminEcustomerController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get all e-customer
    this.router
      .route("/")
      .get(this.eCustomerController.getAllEcustomerController);

    this.router
      .route("/news-letter")
      .get(this.eCustomerController.getAllNewsLetter);

    // get single e-customer
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid e-customer id"
        ),
        this.eCustomerController.getSingleEcustomerController
      );
  }
}
export default AdminEcustomerRouter;
