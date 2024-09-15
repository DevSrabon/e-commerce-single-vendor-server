import { Request, Response } from "express";
import CommonAbstractController from "../commonAbstract/common.abstract.controller";
import CommonService from "../commonService/common.service";

class CommonController extends CommonAbstractController {
  private commonService = new CommonService();
  constructor() {
    super();
  }

  // send email otp
  public sendEmailOtpController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { email, type } = req.body;
      let table = "";
      let field = "";
      let otpFor = "";

      switch (type) {
        case "forget_admin":
          table = "admin_user";
          field = "au_email";
          otpFor = "Admin Reset Password";
          break;
        case "forget_customer":
          table = "e_customer";
          field = "ec_email";
          otpFor = "Customer Reset Password";

        default:
          break;
      }

      const obj = { email, type, otpFor };

      let data = {
        success: false,
        message: "Something is wrong",
      };

      if (type.startsWith("forget")) {
        const checkUser = await this.commonService.checkUserByUniqueKey({
          table,
          field,
          value: email,
        });

        if (checkUser) {
          data = await this.commonService.sendOtpToEmailService(obj);
        } else {
          data = {
            success: false,
            message: "No user found with this email.",
          };
        }
      } else if (type.startsWith("register")) {
        const checkUser = await this.commonService.checkUserByUniqueKey({
          table,
          field,
          value: email,
        });
        if (!checkUser) {
          data = await this.commonService.sendOtpToEmailService(obj);
        } else {
          data = {
            success: false,
            message: "User already exist with this email.",
          };
        }
      } else {
        data = await this.commonService.sendOtpToEmailService(obj);
      }

      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(
          data.message || "Something went wrong",
          400,
          "Cannot send OTP"
        );
      }
    }
  );

  // match email otp
  public matchEmailOtpController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { email, otp, type } = req.body;
      const data = await this.commonService.matchEmailOtpService({
        email,
        otp,
        type,
      });

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );
}

export default CommonController;
