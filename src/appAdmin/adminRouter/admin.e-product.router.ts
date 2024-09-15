import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminEcommerceProductController from '../adminController/admin.e-product.controller';

class AdminEproductRouter extends AdminAbstractRouter {
  private ecommerceController = new AdminEcommerceProductController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // add product into ecommerce and get all ecommerce product
    this.router
      .route('/')
      .post(
        this.productValidator.addEcommerceProductValidator(),
        this.ecommerceController.addProductIntoEcommerceController
      )
      .get(this.ecommerceController.getAllEcommerceProductController);

    // get single ecommerce product and update ecommerce product
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid ecommerce product id'
        ),
        this.ecommerceController.getSingleEcommerceProductController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid ecommerce product id'
        ),
        this.ecommerceController.updateEcommerceProductController
      );
  }
}
export default AdminEproductRouter;
