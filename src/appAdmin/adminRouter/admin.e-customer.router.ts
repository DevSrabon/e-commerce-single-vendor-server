import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminEcustomerController from '../adminController/admin.e-customer.controller';

class AdminEcustomerRouter extends AdminAbstractRouter {
  private eCustomerController = new AdminEcustomerController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // get all e-customer
    this.router
      .route('/')
      .get(this.eCustomerController.getAllEcustomerController);

    // get single e-customer
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid e-customer id'
        ),
        this.eCustomerController.getSingleEcustomerController
      );
  }
}
export default AdminEcustomerRouter;
