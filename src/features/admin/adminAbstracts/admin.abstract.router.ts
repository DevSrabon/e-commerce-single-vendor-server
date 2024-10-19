import { Router } from "express";
import CommonValidator from "../../../utils/validators/commonValidator";
import AdminAuthChecker from "../../common/middlewares/authChecker/adminAuthChecker";
import Uploader from "../../common/middlewares/uploader/uploader";
import AdminAddressValidator from "../utils/validator/adminAddressValidator";
import AdminAuthValidator from "../utils/validator/adminAuthValidator";
import AdminInputValidator from "../utils/validator/adminInputValidator";
import AdminProductValidator from "../utils/validator/adminProductValidator";

class AdminAbstractRouter {
  public router = Router();
  public commonValidator = new CommonValidator();
  public productValidator = new AdminProductValidator();
  public addressValidator = new AdminAddressValidator();
  public adminInputValidator = new AdminInputValidator();
  public authValidator = new AdminAuthValidator();
  public authChecker = new AdminAuthChecker();

  public uploader = new Uploader();
}

export default AdminAbstractRouter;
