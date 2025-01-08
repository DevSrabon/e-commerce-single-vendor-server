import { Request, Response } from "express";
import CommonService from "../../common/commonService/common.service";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminProductService from "../adminService/admin.product.service";
const cartItems = [
  {
    name: "DSLR Camera",
    images: [
      "https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg",
    ],
    description: "DSLR Camera with 4k resolution",
    orderId: "12345",
    price: 2000,
    quantity: 1,
  },
  {
    name: "Camera Tripod",
    images: ["https://cdn.sandberg.world/products/images/lg/134-26_lg.jpg"],
    description: "Sturdy tripod for your camera",
    orderId: "12346",
    price: 100,
    quantity: 2,
  },
];

const deliveryCharge = 50; // in USD
const taxAmount = 10; // in USD
const currency = "aed";

class AdminProductController extends AdminAbstractController {
  private productService = new AdminProductService();
  private commonService = new CommonService();
  constructor() {
    super();
  }

  // create a product controller
  public createProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.createProduct(req);
      if (data.success) {
        res.status(200).json(data);
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
        res.status(200).json(data);
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
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );
  public getHomeData = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getHomeData(req);
      if (data.success) {
        res.status(200).json(data);
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

  // Get All tags
  public getTagsController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.productService.getAllTags(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminProductController;
