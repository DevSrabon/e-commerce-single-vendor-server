import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminAuthController from '../adminController/admin.auth.controller';

class AdminAuthRouter extends AdminAbstractRouter {
  private authController = new AdminAuthController();
  constructor() {
    super();
    this.CallRouter();
  }

  private CallRouter() {
    // admin login
    this.router
      .route('/login')
      .post(
        this.commonValidator.loginValidator(),
        this.authController.adminLoginController
      );

    // create an admin
    this.router
      .route('/create-admin')
      .post(
        this.uploader.storageUploadRaw('admin_files'),
        this.authValidator.adminRegisterInputValidator(),
        this.authController.adminCreateController
      );

    // admin forget password router
    this.router
      .route('/forget/password')
      .post(
        this.commonValidator.commonForgetPassInputValidation(),
        this.authController.forgetPasswordAdminController
      );
  }
}
export default AdminAuthRouter;
