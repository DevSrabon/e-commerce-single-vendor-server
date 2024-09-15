import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminEcommerceQuestionController from '../adminController/admin.e-question.controller';

class AdminEquestionRouter extends AdminAbstractRouter {
  private eQuestionController = new AdminEcommerceQuestionController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // get all e-question
    this.router
      .route('/')
      .get(this.eQuestionController.getAllEquestionController);

    // get single e-question
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid e-question id'
        ),
        this.eQuestionController.getSingleEquestionController
      );

    // question answer
    this.router
      .route('/answer/:qId')
      .patch(
        this.commonValidator.singleParamInputValidator(
          'qId',
          'Provide valid e-question id'
        ),
        this.eQuestionController.updateSingleEquestionController
      );
  }
}
export default AdminEquestionRouter;
