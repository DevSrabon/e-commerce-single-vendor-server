import EcommAbstractRouter from '../ecommAbstracts/ecomm.abstract.router';
import EcommQnaController from '../ecommController/ecomm.qna.controller';
import EcommQnaValidator from '../ecommUtils/ecommValidator/ecommQnaValidator';

class EcommQnaRouter extends EcommAbstractRouter {
  private ecommQnaController = new EcommQnaController();
  private ecommQnaValidator = new EcommQnaValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create qna, get qna of customer
    this.router
      .route('/')
      .post(
        this.authChecker.authChecker,
        this.ecommQnaValidator.createQnaValidator(),
        this.ecommQnaController.createQuestionController
      )
      .get(
        this.authChecker.authChecker,
        this.ecommQnaController.getQnaOfCustomerController
      );

    // delete qna
    this.router
      .route('/:id')
      .delete(
        this.authChecker.authChecker,
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid qna id in param'
        ),
        this.ecommQnaController.deleteQnaController
      );

    // get qna of a product
    this.router
      .route('/product/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid product id in param'
        ),
        this.ecommQnaController.getQnaOfProductController
      );
  }
}
export default EcommQnaRouter;
