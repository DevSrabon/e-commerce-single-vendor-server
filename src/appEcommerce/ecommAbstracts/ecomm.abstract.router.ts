import { Router } from 'express';
import Uploader from '../../common/middlewares/uploader/uploader';
import CommonValidator from '../../utils/validators/commonValidator';
import EcommAuthChecker from '../../common/middlewares/authChecker/ecommAuthChecker';

class EcommAbstractRouter {
  public router = Router();
  public commonValidator = new CommonValidator();
  public uploader = new Uploader();
  public authChecker = new EcommAuthChecker();
}

export default EcommAbstractRouter;
