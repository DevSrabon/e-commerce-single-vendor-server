import { body, query } from "express-validator";

class EcommCartValidator {
  // add to cart validator
  public addToCartValidator() {
    return [
      body("p_id", "Please provide valid product id").isInt().exists(),
      body("v_id", "Please provide valid product variant id").isInt().exists(),
      body("p_color_id", "Please provide valid product color id")
        .isInt()
        .exists(),
      body("size_id", "Please provide valid size id").isInt().exists(),
      body("mode")
        .isIn(["increment", "decrement"])
        .withMessage("mode must be either 'increment' or 'decrement'")
        .optional(),
      body("type", "Please provide valid type")
        .isIn(["cart", "favourite"])
        .exists(),
      body("quantity", "Please provide quantity").isInt().exists(),
    ];
  }

  // Remove from carts
  public removeFromCartValidator() {
    return [
      body("ids")
        .exists({ checkFalsy: true })
        .withMessage("ids field is required")
        .isArray()
        .withMessage("ids must be an array")
        .bail()
        .custom((value) => {
          if (!value.every((item: any) => Number.isInteger(item))) {
            throw new Error("Each id in ids must be an integer");
          }
          return true;
        }),
      body("type")
        .exists({ checkFalsy: true })
        .withMessage("type field is required")
        .isIn(["cart", "favourite"])
        .withMessage("type must be either 'cart' or 'favourite'"),
    ];
  }

  // Get All from carts
  public getAllFromCartValidator() {
    return [
      query("type")
        .exists({ checkFalsy: true })
        .withMessage("type field is required")
        .isIn(["cart", "favourite"])
        .withMessage("type must be either 'cart' or 'favourite'"),
    ];
  }
}
export default EcommCartValidator;
