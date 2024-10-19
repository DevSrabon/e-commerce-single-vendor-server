import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminMailController from "../adminController/admin.mail.controller";
import AdminMailValidator from "../utils/validator/adminMailValidator";

class AdminMailRouter extends AdminAbstractRouter {
  private controller = new AdminMailController();
  private validator = new AdminMailValidator();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Mail routes
    this.router
      .route("/")
      .get(this.validator.getAllMailValidator(), this.controller.getAllMails)
      .delete(this.controller.deleteAllMails);
    this.router
      .route("/:id")
      .get(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.getSingleMail
      )
      .delete(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.deleteMail
      );
  }
}

export default AdminMailRouter;
