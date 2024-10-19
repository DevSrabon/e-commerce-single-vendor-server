import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminRolePermissionController from '../adminController/admin.role-permission.controller';

class AdminRolePermissionRouter extends AdminAbstractRouter {
  private adminRolePermissionController = new AdminRolePermissionController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create module and get all module
    this.router
      .route('/modules')
      .post(
        this.adminInputValidator.createModuleValidator(),
        this.adminRolePermissionController.createModuleController
      )
      .get(this.adminRolePermissionController.getAllModuleController);

    // create role router
    this.router
      .route('/role')
      .post(
        this.adminInputValidator.createRoleValidator(),
        this.adminRolePermissionController.createRoleController
      )
      .get(this.adminRolePermissionController.getAllRoleController);

    // get single role
    this.router
      .route('/role/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid role id'
        ),
        this.adminRolePermissionController.getSingleRoleController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide valid role id'
        ),
        this.adminRolePermissionController.updateRoleController
      );
  }
}

export default AdminRolePermissionRouter;
