import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EcommReviewController from "../ecommController/ecomm.review.controller";
import EcommReviewValidator from "../ecommUtils/ecommValidator/ecommReviewValidator";

class EcommReviewRouter extends EcommAbstractRouter {
  private ecommReviewController = new EcommReviewController();
  private ecommReviewValidator = new EcommReviewValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create review and get all review of a customer
    this.router
      .route("/")
      .post(
        this.authChecker.authChecker,
        this.uploader.storageUploadRaw("ecommerce/review"),
        this.ecommReviewValidator.createEcommReviewValidator(),
        this.ecommReviewController.createReviewController
      )
      .get(
        this.authChecker.authChecker,
        this.ecommReviewController.getReviewOfCustomerController
      );

    this.router
      .route("/like-dislike")
      .post(
        this.authChecker.authChecker,
        this.ecommReviewValidator.addLikeOrDislikeValidator(),
        this.ecommReviewController.addLikeOrDislike
      );

    // get review of a product
    this.router.route("/product/:id").get(
      this.authChecker.authChecker,

      this.commonValidator.singleParamInputValidator(
        "id",
        "Provide a valid product id in params"
      ),
      this.ecommReviewController.getReviewOfProductController
    );

    // delete a review
    this.router
      .route("/:id")
      .delete(
        this.authChecker.authChecker,
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide a valid review id in params"
        ),
        this.ecommReviewController.deleteReviewController
      );

    // get product to review
    this.router
      .route("/to-review/product")
      .get(
        this.authChecker.authChecker,
        this.ecommReviewController.getToReviewProductsController
      );
  }
}
export default EcommReviewRouter;
