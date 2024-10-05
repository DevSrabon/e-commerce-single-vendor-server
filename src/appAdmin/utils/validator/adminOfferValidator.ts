import { body, param, query } from "express-validator";

class AdminOfferValidator {
  // Validators
  public createOfferValidator() {
    return [
      body("offer_name_en", "Offer name in English is required")
        .exists()
        .isString(),
      body("offer_name_ar", "Offer name in Arabic is required")
        .exists()
        .isString(),
      body("discount", "Provide valid discount amount")
        .exists()
        .isFloat({ gt: 0 }),
      body("discount_type", "Provide valid discount type")
        .exists()
        .isIn(["percentage", "fixed"]),
      body("start_date", "Provide a valid start date").exists().isISO8601(),
      body("end_date", "Provide a valid end date").exists().isISO8601(),
      body("product_ids").isString().optional(),
    ];
  }

  public getAllOffersValidator() {
    return [
      query("skip", "skip number must be a positive integer")
        .optional()
        .isInt({ gt: 0 }),
      query("limit", "Limit must be a positive integer")
        .optional()
        .isInt({ gt: 0 }),
    ];
  }

  public updateOfferValidator() {
    return [
      param("id", "Invalid offer ID").exists().isInt(),
      body("offer_name_en", "Offer name in English is required")
        .optional()
        .isString(),
      body("offer_name_ar", "Offer name in Arabic is required")
        .optional()
        .isString(),
      body("discount", "Provide valid discount amount")
        .optional()
        .isFloat({ gt: 0 }),
      body("discount_type", "Provide valid discount type")
        .optional()
        .isIn(["percentage", "fixed"]),
      body("start_date", "Provide a valid start date").optional().isISO8601(),
      body("end_date", "Provide a valid end date").optional().isISO8601(),
      body("product_ids").isString().optional(),
    ];
  }
}

export default AdminOfferValidator;
