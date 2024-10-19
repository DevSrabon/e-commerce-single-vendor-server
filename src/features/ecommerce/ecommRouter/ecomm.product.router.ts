import { NextFunction, Request, Response } from 'express';
import EcommAbstractRouter from '../ecommAbstracts/ecomm.abstract.router';
import EcommProductController from '../ecommController/ecomm.product.controller';
import EcommProductValidator from '../ecommUtils/ecommValidator/ecommProductValidator';

class EcommProductRouter extends EcommAbstractRouter {
  private ecommProductController = new EcommProductController();
  private ecommProductValidator = new EcommProductValidator();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(
        this.ecommProductValidator.getEcommProductQueryValidator(),
        this.ecommProductController.getEcommProductController
      );

    this.router
      .route('/:product')
      .get(
        this.commonValidator.singleStringParamValidator(
          'product',
          'Provide a valid product slug in param'
        ),
        this.ecommProductController.getSingleEcommProductController
      );
  }
}
export default EcommProductRouter;
