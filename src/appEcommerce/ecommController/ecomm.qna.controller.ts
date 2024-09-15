import { Request, Response } from "express";
import EcommAbstractController from "../ecommAbstracts/ecomm.abstract.controller";
import EcommQnaService from "../ecommService/ecomm.qna.service";

class EcommQnaController extends EcommAbstractController {
  private ecommQnaService = new EcommQnaService();
  constructor() {
    super();
  }

  // create question controller
  public createQuestionController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.ecommQnaService.CreateQuestionService(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get qna of a product controller
  public getQnaOfProductController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const data = await this.ecommQnaService.getQnaOfProductService(id);

      res.status(200).json(data);
    }
  );

  // get qna of customer
  public getQnaOfCustomerController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { ec_id } = req.customer;
      const data = await this.ecommQnaService.getQnaOfCustomerService(ec_id);
      res.status(200).json(data);
    }
  );

  // delete qna
  public deleteQnaController = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { ec_id } = req.customer;
      const data = await this.ecommQnaService.deleteQnaService(id, ec_id);
      if (data.success) {
        res.status(200).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}
export default EcommQnaController;
