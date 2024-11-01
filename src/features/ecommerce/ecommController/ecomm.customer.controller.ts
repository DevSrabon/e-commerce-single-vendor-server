import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommCustomerService from "../ecommService/ecomm.customer.service";

class EcommCustomerController extends EcommAbstractController {
  private ecommCustomerService = new EcommCustomerService();
  constructor() {
    super();
  }

  // customer update profile
  public updateCustomerProfileControler = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommCustomerService.updateCustomerProfile(req);
      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error(data.message, 500, "Something went wrong");
      }
    }
  );

  // customer update profile
  public changePasswordCustomerControler = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { ec_email } = req.customer;
      const { old_password, new_password } = req.body;
      const data = await this.ecommCustomerService.changePasswordCustomer(
        ec_email,
        old_password,
        new_password
      );
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get customer profile controller
  public getCustomerProfileController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { ec_email } = req.customer;
      const data = await this.ecommCustomerService.getCustomerProfile(ec_email);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 500, "Something went wrong");
      }
    }
  );

  // create customer shipping address controller
  public createShippingAddressController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      console.log(req.body);
      const data = await this.ecommCustomerService.createShippingAddress(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 500, "Something went wrong");
      }
    }
  );

  // update customer shipping address controller
  public updateShippingAddressController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommCustomerService.updateShippingAddress(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 500, "Something went wrong");
      }
    }
  );

  // get customer shipping address controller
  public getShippingAddressController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { ec_id } = req.customer;
      const data = await this.ecommCustomerService.getShippingAddress(ec_id);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error("Not found", 500, "Something went wrong");
      }
    }
  );

  // delete customer shipping address controller
  public deleteShippingAddressController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommCustomerService.deleteShippingAddress(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 500, "Something went wrong");
      }
    }
  );
}
export default EcommCustomerController;
