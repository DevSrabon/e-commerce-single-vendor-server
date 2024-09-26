import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminColorController from "../adminController/admin.color.controller";

class AdminColorRouter extends AdminAbstractRouter {
  private controller = new AdminColorController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route("/")
      .post(
        this.productValidator.createColorValidator(),
        this.controller.createColor
      )
      .get(
        this.productValidator.getAllColorQueryValidator(),
        this.controller.getAllColors
      );

    this.router
      .route("/:id")
      .patch(
        this.commonValidator.singleParamInputValidator(),
        this.productValidator.updateColorValidator(),
        this.controller.updateSingleColor
      )
      .delete(
        this.commonValidator.singleStringParamValidator(),
        this.controller.deleteSingleColor
      );
  }
}
