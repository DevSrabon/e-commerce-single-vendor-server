import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EccomCouponController from "../ecommController/eccom.coupon.controller";

export class EccomCouponRouter extends EcommAbstractRouter {
  private controller = new EccomCouponController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route("/")
      .get(this.authChecker.authChecker, this.controller.getCoupon);

    this.router
      .route("/:id")
      .get(this.authChecker.authChecker, this.controller.getSingle);
  }
}
