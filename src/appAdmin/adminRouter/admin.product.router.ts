import AdminProductController from '../adminController/admin.product.controller';
import AdminAbstractRouter from '../adminAbstracts/admin.abstract.router';

class AdminProductRouter extends AdminAbstractRouter {
  private productController = new AdminProductController();
  constructor() {
    super();
    this.callrouter();
  }

  private callrouter() {
    // create product and get product by status or all
    this.router
      .route('/')
      .post(
        this.uploader.storageUploadRaw('product_files'),
        this.productValidator.createProductValidator(),
        this.productController.createProductController
      )
      .get(this.productController.getProductController);

    // get all product which has not include in ecommerce
    this.router
      .route('/not-include-ecommerce')
      .get(this.productController.getProductNotInEcommerceController);

    // get all product by supplier id
    this.router
      .route('/by/:supplierId')
      .get(
        this.commonValidator.singleParamInputValidator(
          'supplierId',
          'Provide valid supplier id'
        ),
        this.productController.getAllProductBySupplierController
      );

    // get attribute by single product
    this.router
      .route('/attributes/by/:productId')
      .get(
        this.commonValidator.singleParamInputValidator(
          'productId',
          'Provide valid product id'
        ),
        this.productController.getAttributesByProductController
      );

    // ===============  Category   ============== //

    // create category and get category
    this.router
      .route('/categories')
      .post(
        this.uploader.storageUploadRaw('product_category'),
        this.productValidator.createCategoryValidator(),
        this.productController.createCategoryController
      )
      .get(this.productController.getCategoryController);

    // get single or update category
    this.router
      .route('/categories/:id')
      .patch(
        this.uploader.storageUploadRaw('product_category'),
        this.commonValidator.commonSingleIdInParamsValidator(),
        this.productValidator.updateCategoryValidator(),
        this.productController.updateCategoryController
      )
      .get();

    // ===============  Category End  ============== //

    // get single product and update a single product
    this.router
      .route('/:id')
      .get(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide product id'
        ),
        this.productController.getSingleProductController
      )
      .patch(
        this.commonValidator.singleParamInputValidator(
          'id',
          'Provide product id'
        ),
        this.uploader.storageUploadRaw('product_files'),
        this.productController.updateProductController
      );
  }
}
export default AdminProductRouter;
