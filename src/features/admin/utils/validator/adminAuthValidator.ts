import { body } from 'express-validator';

class AdminAuthValidator {
  // Create an admin
  public adminRegisterInputValidator() {
    return [
      body('au_name', 'Provide admin name').exists().isString(),
      body('au_phone', 'Provide admin phone number').exists().isString(),
      body('au_email', 'Provide admin email').exists().isString(),
      body('au_password', 'Provide admin password').exists(),
      body('au_role', 'Provide admin role').exists().isString(),
    ];
  }
}

export default AdminAuthValidator;
