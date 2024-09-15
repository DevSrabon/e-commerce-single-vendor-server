import { body, query } from 'express-validator';

class AdminAddressValidator {
  // get all sub cities by city input validator
  public getAllSubCitiesByCityValidator() {
    return [
      query('city', 'Provide a valid city id in query')
        .isInt()
        .exists({ checkFalsy: true }),
    ];
  }

  // get all area by sub city input validator
  public getAllAreaBySubCityValidator() {
    return [
      query('sub_city', 'Provide a valid sub_city id in query')
        .isInt()
        .exists({ checkFalsy: true }),
    ];
  }

  // create sub city input validator
  public createSubCityInputValidator() {
    return [
      body('city_id', 'Provide valid city id').exists().isInt(),
      body('name_en', 'Provide valid sub city name in english')
        .isString()
        .notEmpty(),
      body('name_bn', 'Provide valid sub city name in bangla')
        .isString()
        .notEmpty()
        .optional(),
    ];
  }
  // create area input validator
  public createAreaInputValidator() {
    return [
      body('sub_city_id', 'Provide valid sub city id').exists().isInt(),
      body('name_en', 'Provide valid area name in english')
        .isString()
        .notEmpty(),
      body('name_bn', 'Provide valid area name in bangla')
        .isString()
        .notEmpty()
        .optional(),
    ];
  }
}
export default AdminAddressValidator;
