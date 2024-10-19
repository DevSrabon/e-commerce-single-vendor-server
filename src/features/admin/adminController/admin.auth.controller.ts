import { Request, Response } from "express";
import config from "../../../utils/config/config";
import Lib from "../../../utils/lib/lib";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminAuthService from "../adminService/admin.auth.service";

class AdminAuthController extends AdminAbstractController {
  private adminAuthService = new AdminAuthService();
  constructor() {
    super();
  }

  // admin create
  public adminCreateController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.adminAuthService.createAdmin(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // admin login
  public adminLoginController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.adminAuthService.loginAdmin(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // forget password admin
  public forgetPasswordAdminController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { token, email, password } = req.body;

      const tokenVerify: any = Lib.verifyToken(token, config.JWT_SECRET_ADMIN);

      if (tokenVerify) {
        const { email: verifyEmail, type } = tokenVerify;
        if (email === verifyEmail && type === "forget_admin") {
          const data = await this.adminAuthService.forgetPassword({
            password,
            passField: "au_password",
            table: "admin_user",
            userEmailField: "au_email",
            userEmail: email,
          });
          if (data.success) {
            res.status(200).json(data);
          } else {
            res.status(400).json(data);
          }
        } else {
          res.status(400).json({
            success: false,
            message:
              "Unauthorized token, It doesenot match with your email or type",
          });
        }
      } else {
        res
          .status(400)
          .json({ success: false, message: "Invalid token or token expired" });
      }
    }
  );
}

export default AdminAuthController;
