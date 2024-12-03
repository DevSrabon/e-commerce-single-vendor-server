import { Router } from "express";
import CommonValidator from "../../../utils/validators/commonValidator";
import AdminAuthChecker from "../middlewares/authChecker/adminAuthChecker";
import EcommAuthChecker from "../middlewares/authChecker/ecommAuthChecker";
import Uploader from "../middlewares/uploader/uploader";

class CommonAbstractRouter {
  public router = Router();
  public commonValidator = new CommonValidator();
  public adminAuthChecker = new AdminAuthChecker();
  public customerAuthChecker = new EcommAuthChecker();
  public uploader = new Uploader();
}

export default CommonAbstractRouter;
