import { query } from "express-validator";

class AdminMailValidator {
  // Validator for getting all mail with query parameters
  public getAllMailValidator() {
    return [
      query("email", "Email must be a valid email address")
        .optional()
        .isEmail(),
      query("status", "Status must be a valid string").optional().isString(),
      query("skip", "Skip must be a positive integer")
        .optional()
        .isInt({ gt: 0 }),
      query("limit", "Limit must be a positive integer")
        .optional()
        .isInt({ gt: 0 }),
    ];
  }
}

export default AdminMailValidator;
