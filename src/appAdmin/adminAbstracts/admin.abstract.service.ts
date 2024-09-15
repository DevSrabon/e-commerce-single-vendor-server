import { db } from '../../app/database';
import ManageFile from '../../utils/lib/manageFile';

abstract class AdminAbstractServices {
  protected db = db;
  public manageFile = new ManageFile();
}

export default AdminAbstractServices;
