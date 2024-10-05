import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminOfferService from "../adminService/admin.offer.service";

class AdminOfferController extends AdminAbstractController {
  private offerService = new AdminOfferService();

  constructor() {
    super();
  }

  // Get all offers
  public getAllOffers = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.offerService.getAll(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Get single offer by ID
  public getSingleOffer = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.offerService.getSingle(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // Create a new offer
  public createOffer = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.offerService.createOffer(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // Update offer by ID
  public updateOffer = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.offerService.updateSingle(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // Delete offer by ID
  public deleteOffer = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.offerService.delete(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminOfferController;
