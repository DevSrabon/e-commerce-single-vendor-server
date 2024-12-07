import { body } from "express-validator";

class AdminProfileValidator {
  // Validator for getting all mail with query parameters
  public updateAdminProfileValidator() {
    return [
      body("au_name", "Name must be a valid string").optional(),
      body("au_phone", "Phone must be a valid string").optional().isString(),
    ];
  }

  public changePasswordValidator() {
    return [
      body("old_password", "Provide valid old password")
        .isLength({ min: 8 })
        .exists(),
      body("new_password", "Provide valid new password")
        .isLength({ min: 8 })
        .exists(),
    ];
  }
}

export default AdminProfileValidator;
