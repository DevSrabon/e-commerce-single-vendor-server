import { body } from "express-validator";

class EcommOrderValidator {
  // place order validator
  public ecommPlaceOrderValidator() {
    return [
      body("address_id", "Provide valid shipping address id").exists().isInt(),
      body("cart_ids", "Provide valid cart_ids array")
        .optional()
        .isArray({ min: 1 })
        .withMessage("cart_ids must be an array with at least one ID")
        .custom((cart_ids, { req }) => {
          // If cart_ids exist, products must be omitted
          if (cart_ids && cart_ids.length && req.body.products) {
            throw new Error(
              "Products cannot be provided if cart_ids are specified"
            );
          }
          return true;
        }),
      body("products", "Provide valid products array")
        .optional()
        .isArray({ min: 1 })
        .custom((products, { req }) => {
          // If products exist, cart_ids must be omitted
          if (products && products.length && req.body.cart_ids) {
            throw new Error(
              "cart_ids cannot be provided if products are specified"
            );
          }
          return true;
        }),
      body("products.*.id", "Provide valid product id").optional().isInt(),
      body("products.*.cart_id", "Provide valid cart id").optional().isInt(),
      body("products.*.quantity", "Provide valid product quantity")
        .optional()
        .isInt(),
      body("products.*.v_id", "Provide valid product attribute value id")
        .optional()
        .isInt(),
      body("products.*.p_color_id", "Provide valid product color id")
        .optional()
        .isInt(),
      body("products.*.size_id", "Provide valid product size id")
        .optional()
        .isInt(),
    ];
  }
}
export default EcommOrderValidator;
