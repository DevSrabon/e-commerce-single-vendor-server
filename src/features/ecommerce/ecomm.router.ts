import { NextFunction, Request, Response, Router } from 'express';
import EcommAuthRouter from './ecommRouter/ecomm.auth.router';
import EcommCustomerRouter from './ecommRouter/ecomm.customer.router';
import EcommProductRouter from './ecommRouter/ecomm.product.router';
import EcommOrderRouter from './ecommRouter/ecomm.order.router';
import EcommQnaRouter from './ecommRouter/ecomm.qna.router';
import EcommReviewRouter from './ecommRouter/ecomm.review.router';
import EcommCategoryRouter from './ecommRouter/ecomm.category.router';

class EcommRouter {
  public EcommRouter = Router();
  private authRouter = new EcommAuthRouter();
  private customerRouter = new EcommCustomerRouter();
  private productRouter = new EcommProductRouter();
  private orderRouter = new EcommOrderRouter();
  private qnaRouter = new EcommQnaRouter();
  private reviewRouter = new EcommReviewRouter();
  private categoryRouter = new EcommCategoryRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // ecommerce auth router
    this.EcommRouter.use('/auth', this.authRouter.router);

    // ecommerce customer router
    this.EcommRouter.use('/customer', this.customerRouter.router);

    // ecommerce product router
    this.EcommRouter.use('/product', this.productRouter.router);

    // ecommerce order router
    this.EcommRouter.use('/order', this.orderRouter.router);

    // ecommerce qna router
    this.EcommRouter.use('/qna', this.qnaRouter.router);

    // ecommerce review router
    this.EcommRouter.use('/review', this.reviewRouter.router);

    // ecommerce category router
    this.EcommRouter.use('/categories', this.categoryRouter.router);
  }
}
export default EcommRouter;
