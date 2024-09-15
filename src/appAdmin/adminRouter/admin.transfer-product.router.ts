import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminTransferProductController from '../adminController/admin.transfer-product.controller';

class AdminTransferProductRouter extends AdminAbstractRouter {
  private transferPdController = new AdminTransferProductController();
  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    this.router
      .route('/')
      .get(this.transferPdController.getAllTransferListController)
      .post(
        this.productValidator.addTransferProductValidator(),
        this.transferPdController.transferProductController
      );
    // get single transfer update single transfer
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid transfer id'
        ),
        this.transferPdController.getSingleTransferController
      )
      .patch(
        this.authChecker.authChecker,
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid transfer id'
        ),

        this.transferPdController.updateTransferController
      );
  }
}

export default AdminTransferProductRouter;
