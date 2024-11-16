import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminNotificationController from "../adminController/admin.notification.controller";

class AdminNotificationRouter extends AdminAbstractRouter {
  private controller = new AdminNotificationController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Notification routes
    this.router
      .route("/")
      .get(this.controller.getAllNotifications)
      .delete(this.controller.deleteAllNotifications);
    this.router
      .route("/:id")
      .patch(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.updateNotification
      );
  }
}

export default AdminNotificationRouter;
