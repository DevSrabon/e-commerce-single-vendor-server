import { Router } from "express";
import CommonValidator from "../../../utils/validators/commonValidator";
import Uploader from "../middlewares/uploader/uploader";

class CommonAbstractRouter {
  public router = Router();
  public commonValidator = new CommonValidator();
  public uploader = new Uploader();
}

export default CommonAbstractRouter;
