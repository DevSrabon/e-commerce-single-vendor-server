import { query } from "express-validator";

class EcommProductValidator {
  // get ecommerce product query validator
  public getEcommProductQueryValidator() {
    return [
      query("category", "Provide valid category slug in query")
        .isString()
        .optional(),
      query("tag", "Provide valid tag name in query").isString().optional(),
      query("name", "Provide valid product name  in query")
        .isString()
        .optional(),
      query(
        "shortBy",
        "Provide valid short by p_name_en,p_name_ar,p_created_at, base_special_price in query"
      )
        .isIn(["p_name_en", "p_name_ar", "p_created_at", "base_special_price"])
        .optional(),
      query("serialBy", "Provide valid serial asc or desc in query")
        .isIn(["asc", "desc"])
        .optional(),
      query("skip", "Provide skip product count as number in query")
        .isNumeric()
        .optional(),
      query("limit", "Provide limit product count as number slug in query")
        .isNumeric()
        .optional(),
    ];
  }
}

export default EcommProductValidator;
