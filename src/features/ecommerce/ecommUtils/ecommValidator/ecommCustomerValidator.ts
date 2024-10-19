import { body } from 'express-validator';

class EcommCustomerValidator {
  // customer signup validator
  public EcommCustomerSignupValidator() {
    return [
      body('name', 'Provide valid name.')
        .exists()
        .isString()
        .isLength({ min: 4 }),
      body('email', 'Provide valid email.').exists().isEmail(),
      body('password', 'Provide valid password must be length 8.')
        .exists()
        .isString()
        .isLength({ min: 8 }),
    ];
  }

  // customer change password validator
  public ChangePasswordValidator() {
    return [
      body('old_password', 'Provide valid old password')
        .exists()
        .notEmpty()
        .isString(),
      body('new_password', 'Provide valid new password')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 8 }),
    ];
  }

  // create customer shipping address validator
  public createCustomerShippingAddressValidator() {
    return [
      body('name', 'Enter valid customer name')
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body('label', 'Enter valid address label like Home, Office etc')
        .exists()
        .isString()
        .not()
        .isEmpty()
        .optional(),
      body('phone', 'Enter valid customer phone number')
        .exists()
        .isString()
        .isLength({ min: 11, max: 11 }),
      body('address', 'Enter valid customer address')
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body(
        'landmark',
        'Enter valid address landmark that can be easy to find your address'
      )
        .exists()
        .isString()
        .not()
        .isEmpty()
        .optional(),
      body('ar_id', 'Enter valid area id').exists().isNumeric().not().isEmpty(),
    ];
  }
}
export default EcommCustomerValidator;
