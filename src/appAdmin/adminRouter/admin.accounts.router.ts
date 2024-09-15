import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';
import AdminAccountsController from '../adminController/admin.accounts.controller';

class AdminAccountsRouter extends AdminAbstractRouter {
  private accountsController = new AdminAccountsController();

  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // create account and get all account
    this.router
      .route('/')
      .post(
        this.adminInputValidator.createAccountValidator(),
        this.accountsController.createAccountController
      )
      .get(this.accountsController.getAllaccountController);

    // transaction
    this.router
      .route('/transaction')
      .get(this.accountsController.getAllTransactionController);

    // account ledger
    this.router
      .route('/ledger')
      .get(this.accountsController.getAllLedgerByAccountController);

    // single account and update account
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide account id'
        ),
        this.accountsController.getSingleAccountController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide account id'
        ),
        this.accountsController.updateSingleAccountController
      );
  }
}

export default AdminAccountsRouter;
