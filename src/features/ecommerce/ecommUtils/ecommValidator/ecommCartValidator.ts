import { body } from "express-validator";

class EcommCartValidator {
  // add to cart validator
  public addToCartValidator() {
    return [
      body("p_id", "Please provide valid product id").isInt().exists(),
      body("v_id", "Please provide valid product variant id").isInt().exists(),
      body("color_id", "Please provide valid product color id")
        .isInt()
        .exists(),
      body("size_id", "Please provide valid size id").isInt().exists(),
      body("type", "Please provide valid type")
        .isIn(["cart", "favourite"])
        .exists(),
      body("quantity", "Please provide quantity").isInt().exists(),
    ];
  }
}
export default EcommCartValidator;
