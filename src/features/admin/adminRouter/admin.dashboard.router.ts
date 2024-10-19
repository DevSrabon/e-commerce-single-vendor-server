import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminDashboardController from "../adminController/admin.dashboard.controller";
class AdminDashboardRouter extends AdminAbstractRouter {
  private controller = new AdminDashboardController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Currency routes
    this.router.route("/").get(this.controller.getDashboardData);
  }
}

export default AdminDashboardRouter;
