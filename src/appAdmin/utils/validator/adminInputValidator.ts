import { body } from "express-validator";

class AdminInputValidator {
  // staff validator start
  public createStaffValidator() {
    return [
      body("st_name", "Provide staff name").trim().isString().notEmpty(),
      body("st_phone", "Provide staff phone").trim().isString().exists(),
      body("st_email", "Provide staff email")
        .trim()
        .isString()
        .exists()
        .notEmpty(),
      body("st_address", "Provide staff address").trim().isString().notEmpty(),
      body("st_ar_id", "Provide staff area id").exists().isInt(),
    ];
  }

  // staff validator end

  //   warehouse validator start
  public createWarehouseValidator() {
    return [
      body("w_name", "Provide warehouse name").trim().isString().notEmpty(),
      body("w_phone", "Provide warehouse phone").trim().isString().exists(),
      body("w_email", "Provide warehouse email")
        .trim()
        .isString()
        .exists()
        .notEmpty(),
      body("w_address", "Provide warehouse address")
        .trim()
        .isString()
        .notEmpty(),
      body("type", "Provide warehouse type")
        .isIn(["Warehouse", "Store"])
        .exists(),
      body("w_ar_id", "Provide warehouse area id").exists().isInt(),
    ];
  }

  //   warehouse validator end

  // client validator start
  public createClientValidator() {
    return [
      body("cl_w_id", "Provide warehouse id").exists().isInt(),
      body("cl_type", "Provide client type").trim().isString().notEmpty(),
      body("cl_name", "Provide client name").trim().isString().exists(),
      body("cl_address", "Provide client address").trim().isString().exists(),
      body("cl_phone", "Provide client phone").trim().isString().exists(),
      body("cl_email", "Provide client email").trim().isString().exists(),
      body("cl_ar_id", "Provide client area id").isInt().exists(),
      body("cl_contact_name", "Provide client contact name")
        .trim()
        .isString()
        .exists(),
      body("cl_contact_phone", "Provide client contact phone number")
        .trim()
        .isString()
        .exists(),
    ];
  }

  // client validator end

  // supplier validator start
  public createSupplierValidator() {
    return [
      body("s_name", "Provide supplier name").trim().exists().isString(),
      body("s_phone", "Provide supplier phone").trim().isString().exists(),
      body("s_email", "Provide supplier email").trim().isString().exists(),
      body("s_ar_id", "Provide supplier area id").isInt().notEmpty(),
      body("s_address", "Provide supplier address").trim().isString().exists(),
    ];
  }

  public updateSupplierInvoiceValidator() {
    return [
      body("invoice.sp_inv_payment_status", "Provide payment status")
        .isString()
        .notEmpty(),
      body("acc_transaction.ac_tr_ac_id", "Provide transaction account id")
        .isInt()
        .notEmpty(),
      body("acc_transaction.ac_tr_type", "Provide transaction type")
        .isString()
        .isIn(["debit", "credit"])
        .notEmpty(),
      body("acc_transaction.ac_tr_details", "Provide transaction details")
        .isString()
        .optional(),
      body("acc_transaction.ac_tr_remark", "Provide transaction remark")
        .isString()
        .optional(),
    ];
  }
  // supplier validator end

  // Create module input validator
  public createModuleValidator() {
    return [
      body("module_name", "Provide a valid permission module name")
        .exists()
        .isString(),
      body(
        "module_created_by",
        "Provide a valid admin id who is creating this module"
      )
        .exists()
        .isNumeric(),
      body(
        "sub_module",
        "Provide valid submodule is as string in an array"
      ).isArray(),
      body(
        "sub_module.*",
        "Provide valid submodule is as string in an array"
      ).isString(),
    ];
  }

  // create role input validator
  public createRoleValidator() {
    return [
      body("role_name", "Provide a valid role name").exists().isString(),
      body(
        "role_created_by",
        "Provide a valid admin id who is creating this role"
      )
        .exists()
        .isNumeric(),
      body(
        "sub_module",
        "Provide valid submodule is as string in an array"
      ).isArray(),
      body(
        "sub_module.*",
        "Provide valid submodule is as object in an array"
      ).isString(),
    ];
  }

  // attribute validator start

  public createAttributeValidator() {
    return [body("a_name", "Provide attribute name").trim()];
  }

  public createAttributeValueValidator() {
    return [
      body("av_value", "Provide attribute value name")
        .trim()
        .isString()
        .exists(),
      body("av_a_id", "Provide attribute id").isInt().exists(),
    ];
  }

  // attribute validator end

  // purchase validator start
  public purchaseValidator() {
    return [
      body("pur_date", "Provide a purchase date")
        .exists({ checkFalsy: false })
        .isString(),
      body("pur_w_id", "Provide a warehouse id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("pur_s_id", "Provide a supplier id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("pur_discount", "Provide discount").exists({ checkFalsy: false }),
      body("pur_tax", "Provide tax").exists(),
      body("pur_created_by", "Provide created by id").exists().isInt(),
      body("purchase_product", "Provide valid purchase product").isArray(),
    ];
  }

  // purchase validator end

  // account validator start

  public createAccountValidator() {
    return [
      body("ac_w_id", "Provide warehouse id").isInt().notEmpty(),
      body("ac_name", "Provide account name").isString().optional(),
      body("ac_type", "Provide account type").isString().notEmpty(),
      body("ac_number", "Provide account number").isInt().notEmpty(),
      body("ac_bank_name", "Provide bank name").isString().notEmpty(),
      body("ac_bank_branch", "Provide branch name").isString().notEmpty(),
      body("ac_details", "Provide account details").isString().optional(),
    ];
  }

  // account validator end

  // sale validator

  public saleValidator() {
    return [
      body("si_cl_id", "Provide a client id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("si_w_id", "Provide a warehouse id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("si_sale_by_st_id", "Provide a staff id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("si_sale_date", "Provide sale date")
        .exists({ checkFalsy: false })
        .isString(),
      body("si_remark", "Provide valid remark").isString().optional(),
      body("si_vat", "Provide vat").exists({ checkFalsy: false }).isInt(),
      body("si_service_charge", "Provide service charge")
        .exists({ checkFalsy: false })
        .isInt(),
      body("si_discount", "Provide discount")
        .exists({ checkFalsy: false })
        .isInt(),
      body("si_delivery_charge", "Provide valid delivery charge")
        .exists({ checkFalsy: false })
        .isInt(),
      body("si_created_by_au_id", "Provide admin id")
        .exists({ checkFalsy: false })
        .isInt(),
      body("invoice_item", "Provide invoice item")
        .isArray()
        .isLength({ min: 1 }),
      body("invoice_item.*.sii_p_id", "Provide product id").exists({
        checkFalsy: false,
      }),
      body("invoice_item.*.sii_unit_price", "Provide unit price")
        .exists({
          checkFalsy: false,
        })
        .isInt(),
      body("invoice_item.*.sii_quantity", "Provide product quantity").exists({
        checkFalsy: false,
      }),
      body(
        "invoice_item.*.sii_p_av_id",
        "Provide attribute value id"
      ).optional(),
    ];
  }
}

export default AdminInputValidator;
