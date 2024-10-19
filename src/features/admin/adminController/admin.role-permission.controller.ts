import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminRolePermissionService from "../adminService/admin.role-permission.service";

class AdminRolePermissionController extends AdminAbstractController {
  private adminRolePermissionService = new AdminRolePermissionService();
  constructor() {
    super();
  }

  // create module controller
  public createModuleController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.adminRolePermissionService.createModuleService(
        req
      );
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(500).json(data);
      }
    }
  );

  // create role controller
  public createRoleController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.adminRolePermissionService.createRole(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(500).json(data);
      }
    }
  );

  // get all module
  public getAllModuleController = this.asyncWrapper.wrap(
    async (_req: Request, res: Response) => {
      const data = await this.adminRolePermissionService.getAllModule();
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(500).json(data);
      }
    }
  );

  // get all role
  public getAllRoleController = this.asyncWrapper.wrap(
    async (_req: Request, res: Response) => {
      const data = await this.adminRolePermissionService.getAllRole();
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(500).json(data);
      }
    }
  );

  // get single role
  public getSingleRoleController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.adminRolePermissionService.getSingleRole(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(500).json(data);
      }
    }
  );

  // update single role
  public updateRoleController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.adminRolePermissionService.updateRole(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(500).json(data);
      }
    }
  );
}

export default AdminRolePermissionController;
