import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminWareHouseController from "../adminController/admin.warehouse.controller";

class AdminWareHouseRouter extends AdminAbstractRouter {
  private warehouseController = new AdminWareHouseController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use(this.authChecker.authChecker);
    // create warehouse and get all warehouse
    this.router
      .route("/")
      .post(
        this.adminInputValidator.createWarehouseValidator(),
        this.warehouseController.createWarehouseController
      )
      .get(this.warehouseController.getAllWarehouseController);

    // update and delete warehouse
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide warehouse id"
        ),
        this.warehouseController.getSingleWarehouseController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide valid warehouse id"
        ),
        this.warehouseController.updateWarehouseController
      );
  }
}

export default AdminWareHouseRouter;
