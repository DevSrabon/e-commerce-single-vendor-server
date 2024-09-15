import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminEcommerceQuestionService from "../adminService/admin.e-question.service";

class AdminEcommerceQuestionController extends AdminAbstractController {
  private eQuestionService = new AdminEcommerceQuestionService();
  constructor() {
    super();
  }

  // get all ecommerce question controller
  public getAllEquestionController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eQuestionService.getAllEquestionService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(400).json(data);
      }
    }
  );

  // get a single ecommerce question controller
  public getSingleEquestionController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eQuestionService.getSingleEquestionService(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );

  // update a single ecommerce question controller
  public updateSingleEquestionController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.eQuestionService.updateSingleEquestionService(
        req
      );
      if (data.success) {
        res.status(201).json(data);
      } else {
        this.error(data.message, 400);
      }
    }
  );
}

export default AdminEcommerceQuestionController;
