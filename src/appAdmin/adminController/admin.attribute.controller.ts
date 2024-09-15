import { Request, Response } from "express";
import AbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminAttributeService from "../adminService/admin.attribute.service";

class AdminAttributeController extends AbstractController {
  private attributeService = new AdminAttributeService();

  constructor() {
    super();
  }

  // create a attribute
  public createAttributeController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.attributeService.createAttributeService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all attribute
  public getAllAttributeController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.attributeService.getAllAttributeService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
  // get single attribute
  public getSingleAttributeController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.attributeService.getSingleAttributeService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // update single attribute
  public updateSingleAttributeController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = await this.attributeService.updateSingleAttributeService(
        parseInt(id),
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // delete single attribute
  public deleteSingleAttributeController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = await this.attributeService.deleteSingleAttributeService(
        parseInt(id)
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // create a attribute value
  public createAttributeValueController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.attributeService.createAttributeValueService(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get all attribute value
  public getAllAttributeValueController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.attributeService.getAllAttributeValueService();
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // delete single attribute value
  public deleteSingleAttributeValueController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const data =
        await this.attributeService.deleteSingleAttributeValueService(
          parseInt(id)
        );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminAttributeController;
