import CommonService from '../../common/commonService/common.service';
import ManageFile from '../../utils/lib/manageFile';
import { db } from '../../app/database';

abstract class EcommAbstractServices {
  protected db = db;
  public manageFile = new ManageFile();
  public commonService = new CommonService();
}

export default EcommAbstractServices;
