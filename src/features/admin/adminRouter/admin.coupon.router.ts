import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminCouponController from "../adminController/admin.coupon.controller";

class AdminCouponRouter extends AdminAbstractRouter {
  private controller = new AdminCouponController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Offer routes
    this.router
      .route("/")
      .post(this.controller.createCoupon)
      .get(this.controller.getAll);

    this.router
      .route("/:id")
      .get(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.getSingle
      )
      .patch(this.controller.updateCoupon)
      .delete(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.deleteCoupon
      );
  }
}

export default AdminCouponRouter;
