import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminCurrencyController from "../adminController/admin.currency.controller";

class AdminCurrencyRouter extends AdminAbstractRouter {
  private controller = new AdminCurrencyController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Currency routes
    this.router
      .route("/")
      .post(
        // this.productValidator.createCurrencyValidator(),
        this.controller.createCurrency
      )
      .get(
        // this.productValidator.getAllCurrencyQueryValidator(),
        this.controller.getAllCurrencies
      );

    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(),
        this.controller.getCurrencyById
      )
      .patch(
        this.commonValidator.singleParamInputValidator(),
        // this.productValidator.updateCurrencyValidator(),
        this.controller.updateCurrency
      )
      .delete(
        this.commonValidator.singleParamInputValidator(),
        this.controller.deleteCurrency
      );
  }
}

export default AdminCurrencyRouter;
