import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminStaffController from "../adminController/admin.staff.controller";

class AdminStaffRouter extends AdminAbstractRouter {
  private staffController = new AdminStaffController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create staff and get all staff with status
    this.router
      .route("/")
      .post(
        this.uploader.storageUploadRaw("staff_files"),
        this.adminInputValidator.createStaffValidator(),
        this.staffController.createStaffController
      )
      .get(this.staffController.getAllStaffController);

    // get, update and delete  staff
    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide staff id"
        ),
        this.staffController.getSingleStaffController
      )
      .patch(
        this.uploader.storageUploadRaw("staff_files"),
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide staff id"
        ),
        this.staffController.updateStaffController
      )
      .delete(
        this.commonValidator.singleParamInputValidator(
          "id",
          "Provide staff id"
        ),
        this.staffController.deleteStaffController
      );
  }
}

export default AdminStaffRouter;
