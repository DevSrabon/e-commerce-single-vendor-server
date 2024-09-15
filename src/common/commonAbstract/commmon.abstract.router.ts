import { Router } from 'express';
import Uploader from '../middlewares/uploader/uploader';
import CommonValidator from '../../utils/validators/commonValidator';

class CommonAbstractRouter {
  public router = Router();
  public commonValidator = new CommonValidator();
  public uploader = new Uploader();
}

export default CommonAbstractRouter;
