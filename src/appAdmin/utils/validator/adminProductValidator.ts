import { body, query } from "express-validator";

class AdminProductValidator {
  // create product validator
  public createProductValidator() {
    return [
      body("p_s_id", "Provide product supplier id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("p_name", "Provide product name")
        .exists({ checkFalsy: false })
        .isString(),
      body("p_details", "Provide product details")
        .exists({ checkFalsy: false })
        .isString(),
      body("p_name", "Provide product name")
        .exists({ checkFalsy: false })
        .isString(),
      body("category.*", "Provide category array").isArray().notEmpty(),
      body("attribute_value.*", "Provide attribute value array")
        .isArray()
        .notEmpty(),
    ];
  }

  // =========== category validator =============//

  // create a category validator
  public createCategoryValidator() {
    return [
      body("cate_name_en", "Provide valid unique category name in english")
        .exists({ checkFalsy: false })
        .isString(),
      body("cate_name_bn", "Provide valid category name in bangla")
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
      body("cate_name_bn", "Provide valid category name in bangla")
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
      body("ep_details", "Provide e-product details").isString().optional(),
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

      body("ptp_attribute.*.ptpa_av_id", "Provide ptpa_av_id")
        .isInt()
        .optional(),
      body("ptp_attribute.*.ptpa_quantity", "Provide ptpa_quantity")
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
      body("name", "Provide color name").exists().isString(),
      body("code", "Provide color code").exists().isString(),
      body("details", "Provide color details").optional(),
      body("p_id", "Provide product id").exists({ checkNull: false }).isInt(),
    ];
  }
  public updateColorValidator() {
    return [
      body("name", "Provide color name").optional(),
      body("code", "Provide color code").optional(),
      body("details", "Provide color details").optional(),
      body("p_id", "Provide product id").isInt().optional(),
      body("is_active", "Provide color status").isIn(["0", "1"]).optional(),
    ];
  }
  public getAllColorQueryValidator() {
    return [
      query("name", "Provide color name").optional(),
      query("code", "Provide color code").optional(),
      query("is_active", "Provide color status").isIn(["0", "1"]).optional(),
      query("limit", "Provide limit").isInt().optional(),
      query("skip", "Provide skip").isInt().optional(),
    ];
  }
}

export default AdminProductValidator;
