import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminClientController from '../adminController/admin.client.controller';

class AdminClientRouter extends AdminAbstractRouter {
  private clientController = new AdminClientController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // create client and get all client with status
    this.router
      .route('/')
      .post(
        this.uploader.storageUploadRaw('client_files'),
        this.adminInputValidator.createClientValidator(),
        this.clientController.createClientController
      )
      .get(this.clientController.getAllClientController);

    // get, update and delete staff
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide client id'
        ),
        this.clientController.getSingleClientController
      )
      .patch(
        this.uploader.storageUploadRaw('client_files'),
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide client id'
        ),
        this.clientController.updateClientController
      );
  }
}

export default AdminClientRouter;
