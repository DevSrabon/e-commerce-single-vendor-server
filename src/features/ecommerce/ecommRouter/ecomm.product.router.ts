import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EcommProductController from "../ecommController/ecomm.product.controller";
import EcommProductValidator from "../ecommUtils/ecommValidator/ecommProductValidator";

class EcommProductRouter extends EcommAbstractRouter {
  private ecommProductController = new EcommProductController();
  private ecommProductValidator = new EcommProductValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .get(
        this.ecommProductValidator.getEcommProductQueryValidator(),
        this.ecommProductController.getEcommProductController
      );

    // Get All Offer Products
    this.router
      .route("/offer-products")
      .get(this.ecommProductController.getAllOfferProducts);

    // Get All Attributes
    this.router
      .route("/attributes")
      .get(this.ecommProductController.getAllAttributes);

    // Get Best Selling Products
    this.router
      .route("/best-selling-products")
      .get(this.ecommProductController.getBestSellingProducts);

    // Get Single Product
    this.router
      .route("/:product")
      .get(
        this.commonValidator.singleStringParamValidator(
          "product",
          "Provide a valid product slug in param"
        ),
        this.ecommProductController.getSingleEcommProductController
      );
  }
}
export default EcommProductRouter;
