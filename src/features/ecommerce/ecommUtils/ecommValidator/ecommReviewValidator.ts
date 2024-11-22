import { body } from "express-validator";

class EcommReviewValidator {
  // create ecomm review validator
  public createEcommReviewValidator() {
    return [
      body("order_id", "Provide valid order id").exists().isInt(),
      body("parent_id", "Provide valid parent id").isInt().optional(),
      body("rating")
        .if(body("parent_id").not().exists())
        .exists({ checkFalsy: true })
        .withMessage("Rating is required for a top-level review")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
      body("product_id", "Provide valid product id").exists().isInt(),
      body("comment", "Provide valid comment as review")
        .exists()
        .isString()
        .not()
        .isEmpty(),
    ];
  }

  // update review
  public updateEcommReviewValidator() {
    return [
      body("rating", "Provide valid rating 1 to 5")
        .optional()
        .isInt({ min: 1, max: 5 }),
      body("comment", "Provide valid comment as review")
        .optional()
        .isString()
        .not()
        .isEmpty(),
      body("removeImages").isString().optional(),
    ];
  }
  // Like dislike
  public addLikeOrDislikeValidator() {
    return [
      body("id", "Provide valid comment id").exists().isInt(),
      body("type", "Provide valid type").isIn(["like", "dislike"]).exists(),
    ];
  }
}

export default EcommReviewValidator;
