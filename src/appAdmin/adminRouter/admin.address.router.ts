import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminAddressController from "../adminController/admin.address.controller";

class AdminAddressRouter extends AdminAbstractRouter {
  private addressController = new AdminAddressController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get all countries
    this.router
      .route("/country")
      .get(this.addressController.getAllCountries)
      .post(
        this.addressValidator.createCountryInputValidator(),
        this.addressController.createCountry
      );

    // update country
    this.router
      .route("/country/:id")
      .patch(
        this.addressValidator.updateCountryInputValidator(),
        this.commonValidator.singleStringParamValidator(
          "id",
          "Provide country id"
        ),
        this.addressController.updateCountry
      )
      .delete(
        this.commonValidator.singleStringParamValidator(
          "id",
          "Provide country id"
        ),
        this.addressController.deleteCountry
      );
    // get province router
    this.router.route("/province").get(this.addressController.getAllProvince);
    // get cities router
    this.router
      .route("/cities")
      .get(this.addressController.getAllCityByProvinceOrAll);

    // get all sub cities by city
    this.router
      .route("/sub-cities")
      .get(
        this.addressValidator.getAllSubCitiesByCityValidator(),
        this.addressController.getAllSubCityByCity
      )
      .post(
        this.addressValidator.createSubCityInputValidator(),
        this.addressController.createSubCity
      );

    // get all area by sub city
    this.router
      .route("/area")
      .get(
        this.addressValidator.getAllAreaBySubCityValidator(),
        this.addressController.getAllAreaBySubCity
      )
      .post(
        this.addressValidator.createAreaInputValidator(),
        this.addressController.createArea
      );
  }
}
export default AdminAddressRouter;
