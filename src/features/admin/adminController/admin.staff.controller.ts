import { Request, Response } from "express";
import CommonService from "../../common/commonService/common.service";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminStaffService from "../adminService/admin.staff.service";

class AdminStaffController extends AdminAbstractController {
  private staffService = new AdminStaffService();
  private commonService = new CommonService();

  constructor() {
    super();
  }

  // create a staff
  public createStaffController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.staffService.createStaffService(req);

      if (data.success) {
        await this.commonService.createAuditTrailService({
          at_admin_id: req.user.au_id,
          at_details: `Staff has been created: ${req.body.st_name}`,
        });

        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all staff
  public getAllStaffController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.staffService.getAllStuffService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get single staff
  public getSingleStaffController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.staffService.getSingleStaffService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update staff
  public updateStaffController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.staffService.updateStaffService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // delete staff
  public deleteStaffController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.staffService.deleteStaffService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );
}

export default AdminStaffController;
