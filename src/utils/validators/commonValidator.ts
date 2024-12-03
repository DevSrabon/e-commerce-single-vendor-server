import { body, param, query } from "express-validator";

class CommonValidator {
  // commin login input validator
  public loginValidator() {
    return [
      body("type", "Enter Valid type")
        .isIn(["social", "default"])
        .exists()
        .default("default"),
      body("email", "Enter valid email or phone").exists().isString(),
      body("password", "Enter valid password minimum length 8")
        .if(body("type").equals("default").exists())
        .isString()
        .isLength({ min: 8 }),
    ];
  }

  // common single id in params
  public commonSingleIdInParamsValidator() {
    return [
      param("id", "Provide a valid id in params")
        .isInt()
        .exists({ checkFalsy: true }),
    ];
  }

  // get single param input validator
  public singleParamInputValidator(
    id: string = "id",
    errMsg: string = "Provide a valid id in params"
  ) {
    return [param(id, errMsg).exists().isInt()];
  }

  // get single string param validator
  public singleStringParamValidator(
    name: string = "name",
    errMsg: string = "Provide valid name in params"
  ) {
    return [param(name, errMsg).exists().isString().not().isEmpty()];
  }

  // common forget password input validator
  public commonForgetPassInputValidation() {
    return [
      body("token", "Provide valid token").isString(),
      body(
        "password",
        "Please provide valid password thats length must be min 8"
      ).isLength({ min: 8 }),
    ];
  }

  // send email otp input validator
  public sendOtpInputValidator() {
    return [
      body("type", "Please enter valid OTP type").isIn([
        "forget_admin",
        "forget_customer",
      ]),
      body("email", "Enter valid email address").isEmail(),
    ];
  }

  // match email otp input validator
  public matchEmailOtpInputValidator() {
    return [
      body("email", "Enter valid email").isEmail(),
      body("otp", "Enter valid otp").isInt(),
      body("type", "Enter valid otp type").isIn([
        "forget_admin",
        "forget_customer",
      ]),
    ];
  }

  // query validator
  public queryValidator(
    queryParam: string | string[],
    message: string = "Provide valid query "
  ) {
    return [query(queryParam, message).optional()];
  }
}

export default CommonValidator;
