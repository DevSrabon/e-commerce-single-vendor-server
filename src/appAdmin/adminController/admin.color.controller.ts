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

  // update single color
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

  // delete single color
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

  // create a size
  public createSize = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.createSize(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // get all sizes
  public getAllSizes = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAllSize(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // update single size
  public updateSingleSize = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.updateSingleSize(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // delete single size
  public deleteSingleSize = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.deleteSingleSize(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // create a fabric
  public createFabric = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.createFabric(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // get all fabrics
  public getAllFabrics = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.getAllFabric(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // update single fabric
  public updateSingleFabric = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.updateSingleFabric(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // delete single fabric
  public deleteSingleFabric = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.service.deleteSingleFabric(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminColorController;
