import { body } from "express-validator";

class EcommOrderValidator {
  // place order validator
  public ecommPlaceOrderValidator() {
    return [
      body("address_id", "Provide valid shipping address id").exists().isInt(),
      body("delivery_charge", "Provide valid delivery charge of this order")
        .exists()
        .isInt(),
      body("products", "Provide valid products array")
        .exists()
        .isArray({ min: 1 }),
      body("products.*.id", "Provide valid product id").exists().isInt(),
      body("products.*.quantity", "Provide valid product quantity")
        .exists()
        .isInt(),
      body("products.*.v_id", "Provide valid product attribute value id")
        .exists()
        .isInt()
        .optional(),
      body("products.*.color_id", "Provide valid product color id")
        .exists()
        .isInt()
        .optional(),
      body("products.*.size_id", "Provide valid product size id"),
    ];
  }
}
export default EcommOrderValidator;
