import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminColorController from "../adminController/admin.color.controller";

class AdminColorRouter extends AdminAbstractRouter {
  private controller = new AdminColorController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Color routes
    this.router
      .route("/colors")
      .post(
        this.productValidator.createColorValidator(),
        this.controller.createColor
      )
      .get(
        this.productValidator.getAllColorQueryValidator(),
        this.controller.getAllColors
      );

    this.router
      .route("/colors/:id")
      .patch(
        this.commonValidator.singleParamInputValidator(),
        this.productValidator.updateColorValidator(),
        this.controller.updateSingleColor
      )
      .delete(
        this.commonValidator.singleParamInputValidator(),
        this.controller.deleteSingleColor
      );

    // Size routes
    this.router
      .route("/sizes")
      .post(
        this.productValidator.createSizeValidator(),
        this.controller.createSize
      )
      .get(
        this.productValidator.getAllSizeQueryValidator(),
        this.controller.getAllSizes
      );

    this.router
      .route("/sizes/:id")
      .patch(
        this.commonValidator.singleParamInputValidator(),
        this.productValidator.updateSizeValidator(),
        this.controller.updateSingleSize
      )
      .delete(
        this.commonValidator.singleParamInputValidator(),
        this.controller.deleteSingleSize
      );

    // Fabric routes
    this.router
      .route("/fabrics")
      .post(
        this.productValidator.createFabricValidator(),
        this.controller.createFabric
      )
      .get(
        this.productValidator.getAllFabricQueryValidator(),
        this.controller.getAllFabrics
      );

    this.router
      .route("/fabrics/:id")
      .patch(
        this.commonValidator.singleParamInputValidator(),
        this.productValidator.updateFabricValidator(),
        this.controller.updateSingleFabric
      )
      .delete(
        this.commonValidator.singleParamInputValidator(),
        this.controller.deleteSingleFabric
      );
  }
}

export default AdminColorRouter;
