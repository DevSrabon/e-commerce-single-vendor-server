import { body } from 'express-validator';

class EcommReviewValidator {
  // create ecomm review validator
  public createEcommReviewValidator() {
    return [
      body('order_id', 'Provide valid order id').exists().isInt(),
      body('rating', 'Provide valid rating 1 to 5')
        .exists()
        .isInt({ min: 1, max: 5 }),
      body('product_id', 'Provide valid product id').exists().isInt(),
      body('comment', 'Provide valid comment as review')
        .exists()
        .isString()
        .not()
        .isEmpty(),
    ];
  }
}

export default EcommReviewValidator;