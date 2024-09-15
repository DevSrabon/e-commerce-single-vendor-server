import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminEcommerceOrderController from '../adminController/admin.e-order.controller';

class AdminEorderRouter extends AdminAbstractRouter {
  private ecommerceOrderController = new AdminEcommerceOrderController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // get all e-order
    this.router
      .route('/')
      .get(this.ecommerceOrderController.getAllEorderController);

    // get single e-order and update
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid e-order id'
        ),
        this.ecommerceOrderController.getSingleEorderController
      );

    this.router
      .route('/payment/:id')
      .patch(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid e-order id'
        ),
        this.ecommerceOrderController.updateSingleEorderPaymentController
      );

    // order tracking update

    this.router
      .route('/tracking/:orderId')
      .patch(
        this.commonValidator.singleParamInputValidator(
          'orderId',
          'Provide valid e-order id'
        ),
        this.ecommerceOrderController.updateSingleEorderTrackingController
      );
  }
}
export default AdminEorderRouter;
