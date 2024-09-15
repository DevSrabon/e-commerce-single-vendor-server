import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminProductService from "../adminService/admin.product.service";

class AdminProductController extends AdminAbstractController {
  private productService = new AdminProductService();
  constructor() {
    super();
  }

  // create a product controller
  public createProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.createProduct(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // get a single product controller
  public getSingleProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getSingleProduct(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get product controller by status or all or by category
  public getProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getAllProduct(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get product controller which is not add in ecommerce
  public getProductNotInEcommerceController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getProductNotInEcommerceProduct(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get attributes by product id
  public getAttributesByProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getAttributesByProduct(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get all product by supplier id
  public getAllProductBySupplierController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getAllProductBySupplier(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // update a product controller
  public updateProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.updateProduct(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 404, "Not found");
      }
    }
  );

  // create a category controller
  public createCategoryController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.createCategory(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );

  // get category controller
  public getCategoryController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getCategory(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
  // update category controller
  public updateCategoryController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.updateCategory(req);

      console.log({ data });

      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 403);
      }
    }
  );
}

export default AdminProductController;
