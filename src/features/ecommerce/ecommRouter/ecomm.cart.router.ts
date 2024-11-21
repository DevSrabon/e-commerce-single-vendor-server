import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EcommCartController from "../ecommController/eccom.cart.controller";
import EcommCartValidator from "../ecommUtils/ecommValidator/ecommCartValidator";

class EcommCartRouter extends EcommAbstractRouter {
  private controller = new EcommCartController();
  private validator = new EcommCartValidator();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // order router
    this.router
      .route("/")
      .all(this.authChecker.authChecker)
      .post(this.validator.addToCartValidator(), this.controller.addToCart)
      .get(
        this.validator.getAllFromCartValidator(),
        this.controller.getAllCarts
      )
      .delete(
        this.validator.removeFromCartValidator(),
        this.controller.removeFromCart
      );
  }
}
export default EcommCartRouter;
