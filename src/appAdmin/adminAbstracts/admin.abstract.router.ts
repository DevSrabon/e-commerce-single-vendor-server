import { Router } from 'express';
import Uploader from '../../common/middlewares/uploader/uploader';
import CommonValidator from '../../utils/validators/commonValidator';
import AdminAddressValidator from '../utils/validator/adminAddressValidator';
import AdminProductValidator from '../utils/validator/adminProductValidator';
import AdminInputValidator from '../utils/validator/adminInputValidator';
import AdminAuthValidator from '../utils/validator/adminAuthValidator';
import AdminAuthChecker from '../../common/middlewares/authChecker/adminAuthChecker';

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
