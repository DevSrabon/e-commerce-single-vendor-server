import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminDashboardService from "../adminService/admin.dashboard.service";

class AdminDashboardController extends AdminAbstractController {
  constructor() {
    super();
  }
  private service = new AdminDashboardService();

  // Get all currencies
  public getDashboardData = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getDashboardData(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminDashboardController;
