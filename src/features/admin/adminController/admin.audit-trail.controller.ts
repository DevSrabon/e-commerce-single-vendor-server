import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminAuditTrailService from "../adminService/admin.audit-trail.service";

class AdminAuditTrailController extends AdminAbstractController {
  private auditTrailService = new AdminAuditTrailService();
  constructor() {
    super();
  }

  // get all audit trail by admin or all
  public getAllAuditTrailByAdminOrAll = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data =
        await this.auditTrailService.getAllAuditTrailByAdminOrAllService(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );
}

export default AdminAuditTrailController;
