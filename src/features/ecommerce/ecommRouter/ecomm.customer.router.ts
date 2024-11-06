import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EcommCustomerController from "../ecommController/ecomm.customer.controller";
import EcommCustomerValidator from "../ecommUtils/ecommValidator/ecommCustomerValidator";

class EcommCustomerRouter extends EcommAbstractRouter {
  private ecommCustomerController = new EcommCustomerController();
  private ecommCustomerValidator = new EcommCustomerValidator();
  constructor() {
    super();
    this.CallRouter();
  }

  private CallRouter() {
    // get profile
    this.router
      .route("/profile")
      .get(
        this.authChecker.authChecker,
        this.ecommCustomerController.getCustomerProfileController
      )
      .patch(
        this.authChecker.authChecker,
        this.uploader.storageUploadRaw("ecommerce/profile"),
        this.ecommCustomerController.updateCustomerProfileControler
      );

    // castomer change password
    this.router
      .route("/change-password")
      .post(
        this.authChecker.authChecker,
        this.ecommCustomerValidator.ChangePasswordValidator(),
        this.ecommCustomerController.changePasswordCustomerControler
      );

    // create, get customer shipping address router
    this.router
      .route("/shipping-address")
      .post(
        this.authChecker.authChecker,
        this.ecommCustomerValidator.createCustomerShippingAddressValidator(),
        this.ecommCustomerController.createShippingAddressController
      )
      .get(
        this.authChecker.authChecker,
        this.ecommCustomerController.getShippingAddressController
      );

    //update, delete customer shipping address router
    this.router
      .route("/shipping-address/:id")
      .patch(
        this.authChecker.authChecker,
        this.commonValidator.singleParamInputValidator(),
        this.ecommCustomerValidator.updateCustomerShippingAddressValidator(),
        this.ecommCustomerController.updateShippingAddressController
      )
      .delete(
        this.authChecker.authChecker,
        this.commonValidator.singleParamInputValidator(),
        this.ecommCustomerController.deleteShippingAddressController
      );
  }
}
export default EcommCustomerRouter;
