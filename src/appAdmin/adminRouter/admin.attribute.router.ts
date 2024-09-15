import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminAttributeController from '../adminController/admin.attribute.controller';

class AdminAttributeRouter extends AdminAbstractRouter {
  private attributeController = new AdminAttributeController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // create attribute and get all attribute
    this.router
      .route('/')
      .post(
        this.adminInputValidator.createAttributeValidator(),
        this.attributeController.createAttributeController
      )
      .get(
        this.commonValidator.queryValidator(['a_name']),
        this.attributeController.getAllAttributeController
      );

    // create attribute value and get all attribute value
    this.router
      .route('/attribute-value')
      .post(
        this.adminInputValidator.createAttributeValueValidator(),
        this.attributeController.createAttributeValueController
      )
      .get(this.attributeController.getAllAttributeValueController);

    // delete single attribute value
    this.router
      .route('/attribute-value/:id')
      .delete(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide attribute value id'
        ),
        this.attributeController.deleteSingleAttributeValueController
      );

    // get, update and delete single attribute
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide attribute id'
        ),
        this.attributeController.getSingleAttributeController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide attribute id'
        ),
        this.attributeController.updateSingleAttributeController
      )
      .delete(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide attribute id'
        ),
        this.attributeController.deleteSingleAttributeController
      );
  }
}

export default AdminAttributeRouter;
