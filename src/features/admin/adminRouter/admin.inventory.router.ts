import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminInventoryController from "../adminController/admin.inventory.controller";

class AdminInventoryRouter extends AdminAbstractRouter {
  private inventoryController = new AdminInventoryController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get all inventory product
    this.router
      .route("/")
      .get(this.inventoryController.getAlInventoryController);

    // get single inventory product

    this.router.route("/:id").get(
      this.commonValidator.singleParamInputValidator(
        "id",
        "Provide valid inventory id"
      ),

      this.inventoryController.getSingleInventoryController
    );
  }
}

export default AdminInventoryRouter;
