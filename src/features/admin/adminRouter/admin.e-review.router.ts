import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminEcommerceReviewController from "../adminController/admin.e-review.controller";

class AdminEreviewRouter extends AdminAbstractRouter {
  private eReviewController = new AdminEcommerceReviewController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get all e-review
    this.router.route("/").get(this.eReviewController.getAllEreviewController);

    // get single e-review
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid e-review id"
        ),
        this.eReviewController.getSingleEreviewController
      );
  }
}
export default AdminEreviewRouter;
