import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminProfileController from "../adminController/admin.profile.controller";
import AdminProfileValidator from "../utils/validator/adminProfileValidator";

class AdminProfileRouter extends AdminAbstractRouter {
  private adminProfileController = new AdminProfileController();
  private validator = new AdminProfileValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get profile
    this.router
      .route("/")
      .get(this.adminProfileController.getAdminProfileData)
      .patch(
        this.uploader.storageUploadRaw("admin_files"),
        this.validator.updateAdminProfileValidator(),
        this.adminProfileController.updateAdminProfile
      );

    // changed password
    this.router.post(
      "/change-password",
      this.validator.changePasswordValidator(),
      this.adminProfileController.changePassword
    );
  }
}
export default AdminProfileRouter;
