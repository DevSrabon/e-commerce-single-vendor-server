import { body, query } from "express-validator";

class AdminProductValidator {
  // create product validator
  public createProductValidator() {
    return [
      body("w_id", "Provide store id").exists({ checkFalsy: false }),
      body("p_name_en", "Provide product name in english")
        .exists({ checkFalsy: false })
        .isString(),
      body("p_name_ar", "Provide product name in arabic")
        .exists({ checkFalsy: false })
        .isString(),
      body("quantity", "Provide product quantity").isInt().exists(),
      body("stock_alert", "Provide stock alarm")
        .isInt()
        .exists({ checkFalsy: false }),
      body("is_featured", "Provide is featured").isIn(["0", "1"]).exists(),
      body("colors", "Provide colors array").exists(),
      body("sizes", "Provide sizes array").exists(),
      body("variants", "Provide variants array").exists(),
      body("p_details_en", "Provide product details in english")
        .exists({ checkFalsy: false })
        .isString(),
      body("p_details_ar", "Provide product details in arabic")
        .exists({ checkFalsy: false })
        .isString(),
      body("category.*", "Provide category array").isArray().notEmpty(),
    ];
  }

  // =========== category validator =============//

  // create a category validator
  public createCategoryValidator() {
    return [
      body("cate_name_en", "Provide valid unique category name in english")
        .exists({ checkFalsy: false })
        .isString(),
      body("cate_name_ar", "Provide valid category name in arabic")
        .exists({ checkFalsy: false })
        .isString(),
      body("cate_parent_id", "Provide valid parent id").isNumeric().optional(),
    ];
  }

  // update a category  validator
  public updateCategoryValidator() {
    return [
      body("cate_name_en", "Provide valid unique category name in english")
        .exists({ checkFalsy: false })
        .isString()
        .optional(),
      body("cate_name_ar", "Provide valid category name in arabic")
        .exists({ checkFalsy: false })
        .isString()
        .optional(),
      body("cate_parent_id", "Provide valid parent id").isNumeric().optional(),
      body("cate_status", "Provide valid status 0 or 1")
        .isIn(["0", "1"])
        .optional(),
    ];
  }

  //============ damage product validator =============//

  public addDamageProductValidator() {
    return [
      body("p_damage.pd_w_id", "Provide products warehouse id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("p_damage.pd_details", "Provide product details")
        .exists()
        .optional()
        .isString(),
      body("p_damage.pd_date", "Provide product damage date")
        .exists({ checkFalsy: false })
        .isString(),
      body("p_damage.pd_created_by", "Provide product created by").exists({
        checkFalsy: false,
      }),
      body("pd_product.*.pdp_p_id", "Provide product id").exists({
        checkFalsy: false,
      }),
      body("pd_product.*.pdp_quantity", "Provide product id").exists({
        checkFalsy: false,
      }),
    ];
  }

  // ============ ecommerce product validator ===========//

  public addEcommerceProductValidator() {
    return [
      body("ep_p_id", "Provide product id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("ep_price", "Provide product price")
        .exists({ checkFalsy: false })
        .isDecimal(),
      body("ep_sale_price", "Provide sales price")
        .exists({ checkFalsy: false })
        .isDecimal(),
      body("ep_details_en", "Provide e-product details").isString().optional(),
    ];
  }

  // ============ transfer product validator ============/
  public addTransferProductValidator() {
    return [
      body("p_transfer.pt_from_w_id", "Provide pt_from_w_id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("p_transfer.pt_to_w_id", "Provide pt_to_w_id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("p_transfer.pt_send_date", "Provide pt_send_date")
        .exists({ checkFalsy: false })
        .isString(),
      body("p_transfer.pt_created_by", "Provide pt_created_by").exists({
        checkFalsy: false,
      }),
      body("pt_product.*.ptp_p_id", "Provide ptp_p_id")
        .exists({
          checkFalsy: false,
        })
        .notEmpty(),
      body("pt_product.*.ptp_quantity", "Provide ptp_quantity").exists({
        checkFalsy: false,
      }),

      body("ptp_variant.*.ptpa_v_id", "Provide ptpa_v_id").isInt().optional(),
      body("ptp_variant.*.ptpa_quantity", "Provide ptpa_quantity")
        .isInt()
        .optional(),
    ];
  }

  public getAllTransferProductQueryValidator() {
    return [
      query("transfer_from")
        .exists()
        .withMessage("Provide transfer from warehouse id")
        .optional(),
      query("transfer_to")
        .exists()
        .withMessage("Provide transfer to warehouse id")
        .optional(),
    ];
  }

  // ============ product attribute validator ============//
  public createColorValidator() {
    return [
      body("color_en", "Provide color in english").exists().isString(),
      body("color_ar", "Provide color in arabic").exists().isString(),
      body("code", "Provide color code").exists().isString(),
      body("details_en", "Provide color details").optional(),
      body("details_ar", "Provide color details").optional(),
    ];
  }
  public updateColorValidator() {
    return [
      body("color_en", "Provide color in english").optional().isString(),
      body("color_ar", "Provide color in arabic").optional().isString(),
      body("code", "Provide color code").optional(),
      body("details_en", "Provide color details").optional(),
      body("details_ar", "Provide color details").optional(),
      body("p_id", "Provide product id").isInt().optional(),
      body("is_active", "Provide color status").isIn(["0", "1"]).optional(),
    ];
  }
  public getAllColorQueryValidator() {
    return [
      query("color", "Provide  color").optional(),
      query("code", "Provide color code").optional(),
      query("is_active", "Provide color status").isIn(["0", "1"]).optional(),
      query("limit", "Provide limit").isInt().optional(),
      query("skip", "Provide skip").isInt().optional(),
      query("sortBy", "Provide sortBy")
        .optional()
        .notEmpty()
        .withMessage("sortBy cannot be empty"),

      query("sortOrder", "Provide sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Invalid sortOrder value")
        .notEmpty()
        .withMessage("sortOrder cannot be empty"),
    ];
  }

  // Validator for creating a new size
  public createSizeValidator() {
    return [
      body("size")
        .notEmpty()
        .withMessage("Size is required")
        .isString()
        .withMessage("Size must be a string")
        .isLength({ max: 45 })
        .withMessage("Size cannot exceed 45 characters"),
      body("height")
        .notEmpty()
        .withMessage("Height is required")
        .isString()
        .withMessage("Height must be a string")
        .isLength({ max: 45 })
        .withMessage("Height cannot exceed 45 characters"),
      body("weight")
        .notEmpty()
        .withMessage("Weight is required")
        .isString()
        .withMessage("Weight must be a string")
        .isLength({ max: 45 })
        .withMessage("Weight cannot exceed 45 characters"),
      body("details")
        .optional()
        .isString()
        .withMessage("Details must be a string")
        .isLength({ max: 555 })
        .withMessage("Details cannot exceed 555 characters"),
      body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be a boolean value"),
    ];
  }

  // Validator for querying sizes
  public getAllSizeQueryValidator() {
    return [
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive integer"),
      query("page")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Page must be a non-negative integer"),
      query("size").optional().isString().withMessage("Size must be a string"),
      query("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be a boolean value"),
    ];
  }

  // Validator for updating a size
  public updateSizeValidator() {
    return [
      body("size")
        .optional()
        .isString()
        .withMessage("Size must be a string")
        .isLength({ max: 45 })
        .withMessage("Size cannot exceed 45 characters"),
      body("height")
        .optional()
        .isString()
        .withMessage("Height must be a string")
        .isLength({ max: 45 })
        .withMessage("Height cannot exceed 45 characters"),
      body("weight")
        .optional()
        .isString()
        .withMessage("Weight must be a string")
        .isLength({ max: 45 })
        .withMessage("Weight cannot exceed 45 characters"),
      body("details")
        .optional()
        .isString()
        .withMessage("Details must be a string")
        .isLength({ max: 555 })
        .withMessage("Details cannot exceed 555 characters"),
      body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be a boolean value"),
    ];
  }

  // Validator for creating a new fabric
  public createFabricValidator() {
    return [
      body("name_en")
        .notEmpty()
        .withMessage("Fabric name in English is required")
        .isString()
        .withMessage("Fabric name in English must be a string")
        .isLength({ max: 255 })
        .withMessage("Fabric name cannot exceed 255 characters"),
      body("name_ar")
        .notEmpty()
        .withMessage("Fabric name in Arabic is required")
        .isString()
        .withMessage("Fabric name in Arabic must be a string")
        .isLength({ max: 255 })
        .withMessage("Fabric name cannot exceed 255 characters"),
      body("details_en")
        .optional()
        .isString()
        .withMessage("Details in English must be a string")
        .isLength({ max: 555 })
        .withMessage("Details in English cannot exceed 555 characters"),
      body("details_ar")
        .optional()
        .isString()
        .withMessage("Details in Arabic must be a string")
        .isLength({ max: 555 })
        .withMessage("Details in Arabic cannot exceed 555 characters"),
      body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be a boolean value"),
    ];
  }

  // Validator for querying fabrics
  public getAllFabricQueryValidator() {
    return [
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive integer"),
      query("page")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Page must be a non-negative integer"),
      query("name_en")
        .notEmpty()
        .withMessage("Fabric name in English is required")
        .isString()
        .optional()
        .withMessage("Fabric name in English must be a string")
        .isLength({ max: 255 })
        .withMessage("Fabric name cannot exceed 255 characters"),
      query("name_ar")
        .notEmpty()
        .optional()
        .withMessage("Fabric name in Arabic is required")
        .isString()
        .optional()
        .withMessage("Fabric name in Arabic must be a string")
        .isLength({ max: 255 })
        .withMessage("Fabric name cannot exceed 255 characters"),
      query("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be a boolean value"),
    ];
  }

  // Validator for updating a fabric
  public updateFabricValidator() {
    return [
      body("name_en")
        .notEmpty()
        .withMessage("Fabric name in English is required")
        .isString()
        .optional()
        .withMessage("Fabric name in English must be a string")
        .isLength({ max: 255 })
        .withMessage("Fabric name cannot exceed 255 characters"),
      body("name_ar")
        .notEmpty()
        .optional()
        .withMessage("Fabric name in Arabic is required")
        .isString()
        .optional()
        .withMessage("Fabric name in Arabic must be a string")
        .isLength({ max: 255 })
        .withMessage("Fabric name cannot exceed 255 characters"),
      body("details_en")
        .optional()
        .isString()
        .withMessage("Details in English must be a string")
        .isLength({ max: 555 })
        .withMessage("Details in English cannot exceed 555 characters"),
      body("details_ar")
        .optional()
        .isString()
        .withMessage("Details in Arabic must be a string")
        .isLength({ max: 555 })
        .withMessage("Details in Arabic cannot exceed 555 characters"),
      body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be a boolean value"),
    ];
  }
}

export default AdminProductValidator;
