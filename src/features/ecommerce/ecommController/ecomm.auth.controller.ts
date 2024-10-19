import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import config from "../../../utils/config/config";
import Lib from "../../../utils/lib/lib";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommAuthService from "../ecommService/ecomm.auth.service";

class EcommAuthController extends EcommAbstractController {
  private ecommAuthService = new EcommAuthService();
  constructor() {
    super();
  }

  // signup customer controller
  public customerSignupController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommAuthService.signupCustomerService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, data.code, "Data conflict");
      }
    }
  );

  // login customer controller
  public customerLoginController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommAuthService.loginCustomerService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, data.code, "Unauthorized data");
      }
    }
  );

  // customer forget password
  public customerForgetPassword = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { token, password } = req.body;

      const verify = Lib.verifyToken(token, config.JWT_SECRET_CUSTOMER);
      if (!verify) {
        res.status(400).json({ success: false, message: "Invalid token" });
        return;
      }

      const { email, type } = verify as JwtPayload;

      if (type !== "forget_customer") {
        res.status(400).json({ success: false, message: "Invalid token" });
        return;
      }

      const data = await this.ecommAuthService.changeCustomerPassword(
        password,
        email
      );

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // delete customer controller
  public deleteCustomer = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommAuthService.deleteCustomer(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, data.code, "Unauthorized data");
      }
    }
  );
}
export default EcommAuthController;
