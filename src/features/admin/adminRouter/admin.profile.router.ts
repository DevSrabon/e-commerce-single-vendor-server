import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminProfileController from '../adminController/admin.profile.controller';

class AdminProfileRouter extends AdminAbstractRouter {
  private adminProfileController = new AdminProfileController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get profile
    this.router
      .route('/')
      .get(
        this.authChecker.authChecker,
        this.adminProfileController.getAdminProfileData
      );
  }
}
export default AdminProfileRouter;
