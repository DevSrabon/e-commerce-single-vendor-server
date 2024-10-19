import EcommAbstractRouter from '../ecommAbstracts/ecomm.abstract.router';
import EcommCategoryController from '../ecommController/ecomm.category.controller';

class EcommCategoryRouter extends EcommAbstractRouter {
  private ecommCategory = new EcommCategoryController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create product and get product by status or all
    this.router.route('/').get(this.ecommCategory.getCategory);
  }
}
export default EcommCategoryRouter;
