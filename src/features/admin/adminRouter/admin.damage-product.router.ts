import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminDamageProductController from "../adminController/admin.damage-product.controller";

class AdminDamageProductRouter extends AdminAbstractRouter {
  private damageProductController = new AdminDamageProductController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // add damage product and get damage product
    this.router
      .route("/")
      .post(
        this.productValidator.addDamageProductValidator(),
        this.damageProductController.addDamageProductController
      )
      .get(this.damageProductController.getAllDamageProductController);

    // get single damage product and update damage product
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid damage product id"
        ),
        this.damageProductController.getSingleDamageProductController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid damage product id"
        ),

        this.damageProductController.updateDamageProductController
      );
  }
}
export default AdminDamageProductRouter;
