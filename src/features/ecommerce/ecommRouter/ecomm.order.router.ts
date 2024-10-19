import EcommOrderValidator from '../ecommUtils/ecommValidator/ecommOrderValidator';
import EcommOrderController from '../ecommController/ecomm.order.controller';
import EcommAbstractRouter from '../ecommAbstracts/ecomm.abstract.router';

class EcommOrderRouter extends EcommAbstractRouter {
  private ecommOrderController = new EcommOrderController();
  private ecommOrderValidator = new EcommOrderValidator();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // order router
    this.router
      .route('/')
      .post(
        this.authChecker.authChecker,
        this.ecommOrderValidator.ecommPlaceOrderValidator(),
        this.ecommOrderController.placeOrderController
      )
      .get(
        this.authChecker.authChecker,
        this.ecommOrderController.getOrderService
      );

    // single order rotuer
    this.router
      .route('/:id')
      .get(
        this.authChecker.authChecker,
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid order id'
        ),
        this.ecommOrderController.geSingleOrderService
      );
  }
}
export default EcommOrderRouter;
