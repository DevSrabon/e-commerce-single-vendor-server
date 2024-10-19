import { Router } from "express";
import CommonValidator from "../../../utils/validators/commonValidator";
import EcommAuthChecker from "../../common/middlewares/authChecker/ecommAuthChecker";
import Uploader from "../../common/middlewares/uploader/uploader";

class EcommAbstractRouter {
  public router = Router();
  public commonValidator = new CommonValidator();
  public uploader = new Uploader();
  public authChecker = new EcommAuthChecker();
}

export default EcommAbstractRouter;
