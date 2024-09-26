import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminColorService from "../adminService/admin.color.service";

class AdminColorController extends AdminAbstractController {
  constructor() {
    super();
  }
  private service = new AdminColorService();

  // create a color
  public createColor = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.createColor(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // get all colors
  public getAllColors = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAllColors(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  //   get single color
  public updateSingleColor = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.updateSingleColor(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  //   delete single color
  public deleteSingleColor = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.deleteSingleColor(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminColorController;
