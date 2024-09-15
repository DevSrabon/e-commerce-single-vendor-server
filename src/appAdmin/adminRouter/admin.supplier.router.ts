import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminSupplierController from '../adminController/admin.supplier.controller';

class AdminSupplierRouter extends AdminAbstractRouter {
  private supplierController = new AdminSupplierController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // create supplier and get all supplier with status

    this.router
      .route('/')
      .post(
        this.uploader.storageUploadRaw('supplier_files'),
        this.adminInputValidator.createSupplierValidator(),
        this.supplierController.createSupplierController
      )
      .get(this.supplierController.getAllSupplierController);

    this.router
      .route('/invoice')
      .get(this.supplierController.getAllSupplierInvoiceController);

    // supplier invoice
    this.router
      .route('/invoice/:id')
      .get(
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.supplierController.getSingleSupplierInvoiceController
      )
      .patch(
        this.adminInputValidator.updateSupplierInvoiceValidator(),
        this.supplierController.updateSupplierInvoiceController
      );

    // =============== ledger and report===============//

    this.router
      .route('/report/:id')
      .get(this.supplierController.getAllReportBySupplierController);

    this.router
      .route('/ledger/:id')
      .get(this.supplierController.getAllLedgerBySupplierController);

    // ================ end ================//

    // get single supplier
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide supplier id'
        ),
        this.supplierController.getSingleSupplierController
      )
      .patch(
        this.uploader.storageUploadRaw('supplier_files'),
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide supplier id'
        ),
        this.supplierController.updateSupplierController
      );
  }
}

export default AdminSupplierRouter;
