import { Router } from 'express';
import AdminEcustomerRouter from './admin.e-customer.router';
import AdminEreviewRouter from './admin.e-review.router';
import AdminEquestionRouter from './admin.e-question.router';
import AdminEorderRouter from './admin.e-order.router';
import AdminEproductRouter from './admin.e-product.router';

class AdminEcommerceRouter {
  public eRouter = Router();
  private eProductRouter = new AdminEproductRouter();
  private eOrderRouter = new AdminEorderRouter();
  private eQuestionRouter = new AdminEquestionRouter();
  private eReviewRouter = new AdminEreviewRouter();
  private eCustomerRouter = new AdminEcustomerRouter();
  constructor() {
    this.callrouter();
  }

  private callrouter() {
    this.eRouter.use('/product', this.eProductRouter.router);
    this.eRouter.use('/order', this.eOrderRouter.router);
    this.eRouter.use('/question', this.eQuestionRouter.router);
    this.eRouter.use('/review', this.eReviewRouter.router);
    this.eRouter.use('/customer', this.eCustomerRouter.router);
  }
}
export default AdminEcommerceRouter;
