import EcommCustomerValidator from "../ecommUtils/ecommValidator/ecommCustomerValidator";
import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EcommAuthController from "../ecommController/ecomm.auth.controller";

class EcommAuthRouter extends EcommAbstractRouter {
  private ecommAuthController = new EcommAuthController();
  private ecommCustomerValidator = new EcommCustomerValidator();
  constructor() {
    super();
    this.CallRouter();
  }

  private CallRouter() {
    // customer login
    this.router
      .route("/login")
      .post(
        this.commonValidator.loginValidator(),
        this.ecommAuthController.customerLoginController
      );

    // customer signup
    this.router
      .route("/signup")
      .post(
        this.ecommCustomerValidator.EcommCustomerSignupValidator(),
        this.ecommAuthController.customerSignupController
      );

    // customer forget password
    this.router
      .route("/forget/password")
      .post(
        this.commonValidator.commonForgetPassInputValidation(),
        this.ecommAuthController.customerForgetPassword
      );

    // delete customer
    this.router
      .route("/delete/customer/:id")
      .delete(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.ecommAuthController.deleteCustomer
      );
  }
}
export default EcommAuthRouter;
