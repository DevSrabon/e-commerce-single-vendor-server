import { check, param } from 'express-validator';
import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminAuditTrailController from '../adminController/admin.audit-trail.controller';

class AdminAuditTrailRouter extends AdminAbstractRouter {
  private auditController = new AdminAuditTrailController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get all audit trail or get all audit by admin id
    this.router
      .route('/:id')
      .get(
        [param('id').notEmpty().withMessage('Param must be a id or all')],
        this.auditController.getAllAuditTrailByAdminOrAll
      );
  }
}

export default AdminAuditTrailRouter;
