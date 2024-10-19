import { body, query } from "express-validator";

class AdminAddressValidator {
  // get all sub cities by city input validator
  public getAllSubCitiesByCityValidator() {
    return [
      query("city", "Provide a valid city id in query")
        .isInt()
        .exists({ checkFalsy: true }),
    ];
  }

  public createCountryInputValidator() {
    return [
      body("c_name_en", "Provide valid country name in english")
        .exists()
        .isString(),
      body("c_name_ar", "Provide valid country name in arabic")
        .exists()
        .isString(),
      body("c_short_name", "Provide valid country short name")
        .exists()
        .isString(),
    ];
  }
  public updateCountryInputValidator() {
    return [
      body("c_name_en", "Provide valid country name in english")
        .optional()
        .isString(),
      body("c_name_ar", "Provide valid country name in arabic")
        .optional()
        .isString(),
      body("c_short_name", "Provide valid country short name")
        .optional()
        .isString(),
    ];
  }

  // get all area by sub city input validator
  public getAllAreaBySubCityValidator() {
    return [
      query("sub_city", "Provide a valid sub_city id in query")
        .isInt()
        .exists({ checkFalsy: true }),
    ];
  }

  // create sub city input validator
  public createSubCityInputValidator() {
    return [
      body("city_id", "Provide valid city id").exists().isInt(),
      body("name_en", "Provide valid sub city name in english")
        .isString()
        .notEmpty(),
      body("name_ar", "Provide valid sub city name in bangla")
        .isString()
        .notEmpty()
        .optional(),
    ];
  }
  // create area input validator
  public createAreaInputValidator() {
    return [
      body("sub_city_id", "Provide valid sub city id").exists().isInt(),
      body("name_en", "Provide valid area name in english")
        .isString()
        .notEmpty(),
      body("name_ar", "Provide valid area name in bangla")
        .isString()
        .notEmpty()
        .optional(),
    ];
  }
}
export default AdminAddressValidator;
