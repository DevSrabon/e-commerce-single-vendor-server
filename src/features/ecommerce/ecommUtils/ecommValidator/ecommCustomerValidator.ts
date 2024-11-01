import { body } from "express-validator";

class EcommCustomerValidator {
  // customer signup validator
  public EcommCustomerSignupValidator() {
    return [
      body("name", "Provide valid name.")
        .exists()
        .isString()
        .isLength({ min: 4 }),
      body("email", "Provide valid email.").exists().isEmail(),
      body("password", "Provide valid password must be length 8.")
        .exists()
        .isString()
        .isLength({ min: 8 }),
    ];
  }

  // customer change password validator
  public ChangePasswordValidator() {
    return [
      body("old_password", "Provide valid old password")
        .exists()
        .notEmpty()
        .isString(),
      body("new_password", "Provide valid new password")
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 8 }),
    ];
  }

  // create customer shipping address validator
  public createCustomerShippingAddressValidator() {
    return [
      body("name", "Enter valid customer name")
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body("label", "Enter valid address label like Home, Office etc")
        .isIn(["Home", "Office", "Other"])
        .exists()
        .isString()
        .not()
        .isEmpty()
        .optional(),
      body("phone", "Enter valid customer phone number")
        .exists()
        .isString()
        .matches(/^\+[1-9]\d{1,14}$/)
        .isMobilePhone("any")
        .isLength({ min: 4, max: 18 }),

      body("state", "Enter valid state that can be easy to find your address")
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body("city", "Enter valid city that can be easy to find your address")
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body(
        "zip_code",
        "Enter valid zip code  that can be easy to find your address"
      )
        .exists()
        .isString()
        .isLength({ min: 4, max: 4 })
        .not()
        .isEmpty(),
      body("street_address", "Enter valid customer street address")
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body("apt", "Enter valid apartment, suite, unit, building, floor, etc")
        .isString()
        .optional(),
      body("country_id", "Enter valid country id")
        .exists()
        .isNumeric()
        .not()
        .isEmpty(),
    ];
  }
  // update customer shipping address validator
  public updateCustomerShippingAddressValidator() {
    return [
      body("name", "Enter valid customer name")
        .optional()
        .isString()
        .not()
        .isEmpty(),
      body("label", "Enter valid address label like Home, Office etc")
        .isIn(["Home", "Office", "Other"])
        .optional()
        .isString()
        .not()
        .isEmpty()
        .optional(),
      body("phone", "Enter valid customer phone number")
        .optional()
        .isString()
        .matches(/^\+[1-9]\d{1,14}$/)
        .isMobilePhone("any")
        .isLength({ min: 4, max: 18 }),

      body("state", "Enter valid state that can be easy to find your address")
        .optional()
        .isString()
        .not()
        .isEmpty(),
      body("city", "Enter valid city that can be easy to find your address")
        .optional()
        .isString()
        .not()
        .isEmpty(),
      body(
        "zip_code",
        "Enter valid zip code  that can be easy to find your address"
      )
        .optional()
        .isString()
        .isLength({ min: 4, max: 4 })
        .not()
        .isEmpty(),
      body("street_address", "Enter valid customer street address")
        .optional()
        .isString()
        .not()
        .isEmpty(),
      body("apt", "Enter valid apartment, suite, unit, building, floor, etc")
        .isString()
        .optional(),
      body("country_id", "Enter valid country id")
        .optional()
        .isNumeric()
        .not()
        .isEmpty(),
    ];
  }
}
export default EcommCustomerValidator;
