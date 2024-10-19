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
      const { au_id } = req.user;
      const data = await this.AdminProfileService.getAdminProfileData(au_id);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(401).json(data);
      }
    }
  );
}
export default AdminProfileController;
