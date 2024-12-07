import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminProfileService from "../adminService/admin.profile.service";

class AdminProfileController extends AdminAbstractController {
  private AdminProfileService = new AdminProfileService();
  constructor() {
    super();
  }

  // get profile data
  public getAdminProfileData = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.AdminProfileService.getAdminProfileData(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(401).json(data);
      }
    }
  );
  // update profile data
  public updateAdminProfile = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.AdminProfileService.updateAdminProfile(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        res.status(code).json(data);
      }
    }
  );
  public changePassword = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdminProfileService.changePassword(
        req
      );
      if (data.success) {
        res.status(code).json(data);
      } else {
        res.status(code).json(data);
      }
    }
  );
}
export default AdminProfileController;
