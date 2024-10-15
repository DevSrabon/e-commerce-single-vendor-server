import CommonAbstractRouter from "../commonAbstract/commmon.abstract.router";
import CommonController from "../commonController/common.controller";

class CommonRouter extends CommonAbstractRouter {
  private CommonController = new CommonController();
  constructor() {
    super();
    this.callRouter();
  }

  // call router
  private callRouter() {
    // send Email otp
    this.router.post(
      "/send-email-otp",
      this.commonValidator.sendOtpInputValidator(),
      this.CommonController.sendEmailOtpController
    );

    // match email otp
    this.router.post(
      "/match-email-otp",
      this.commonValidator.matchEmailOtpInputValidator(),
      this.CommonController.matchEmailOtpController
    );

    this.router.get("/currency", this.CommonController.getAllCurrencies);
  }
}
export default CommonRouter;
