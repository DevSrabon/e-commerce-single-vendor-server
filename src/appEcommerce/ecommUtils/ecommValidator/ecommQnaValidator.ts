import { body } from 'express-validator';

class EcommQnaValidator {
  // create question validator
  public createQnaValidator() {
    return [
      body('question', 'Provide valid question.')
        .exists()
        .isString()
        .not()
        .isEmpty(),
      body('product_id', 'Provide valid product id.')
        .exists()
        .isNumeric()
        .not()
        .isEmpty(),
    ];
  }
}
export default EcommQnaValidator;
