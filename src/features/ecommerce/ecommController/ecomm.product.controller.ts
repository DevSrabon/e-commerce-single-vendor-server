import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommProductService from "../ecommService/ecomm.product.service";

class EcommProductController extends EcommAbstractController {
  private ecommProductService = new EcommProductService();
  constructor() {
    super();
  }

  // Get All Offer Products
  public getAllOfferProducts = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getAllOfferProducts(req);
      res.json(data);
    }
  );
  public getBanners = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getBanners(req);
      res.json(data);
    }
  );

  // get ecommerce product filter name, tags, category, short by limit skip
  public getEcommProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getEcommProductService(req);

      res.status(200).json(data);
    }
  );
  public getHomeData = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getHomeData(req);

      res.status(200).json(data);
    }
  );

  // Get All Attributes
  public getAllAttributes = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getAllAttributes(req);
      res.status(200).json(data);
    }
  );

  // Get Best selling products
  public getBestSellingProducts = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommProductService.getBestSellingProducts(req);
      res.status(200).json(data);
    }
  );
  // get single ecommerce product
  public getSingleEcommProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { product } = req.params;
      const data = await this.ecommProductService.getEcommSingleProduct(
        product
      );

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default EcommProductController;
