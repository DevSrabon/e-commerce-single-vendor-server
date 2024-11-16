import EcommAbstractRouter from "../ecommAbstracts/ecomm.abstract.router";
import EcommNotificationController from "../ecommController/ecomm.notification.controller";

class EcommNotificationRouter extends EcommAbstractRouter {
  private controller = new EcommNotificationController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Mail routes
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

export default EcommNotificationRouter;
