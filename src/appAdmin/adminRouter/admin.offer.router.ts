import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";

import AdminOfferController from "../adminController/admin.offer.controller";
import AdminOfferValidator from "../utils/validator/adminOfferValidator";

class AdminOfferRouter extends AdminAbstractRouter {
  private controller = new AdminOfferController();
  private validator = new AdminOfferValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Offer routes
    this.router
      .route("/")
      .post(
        this.uploader.storageUploadRaw("offers"),
        this.validator.createOfferValidator(),
        this.controller.createOffer
      )
      .get(
        this.validator.getAllOffersValidator(),
        this.controller.getAllOffers
      );

    this.router
      .route("/:id")
      .get(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.getSingleOffer
      )
      .patch(this.validator.updateOfferValidator(), this.controller.updateOffer)
      .delete(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.controller.deleteOffer
      );
  }
}

export default AdminOfferRouter;
