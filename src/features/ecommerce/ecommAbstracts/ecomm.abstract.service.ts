import { db } from "../../../app/database";
import ManageFile from "../../../utils/lib/manageFile";
import CommonService from "../../common/commonService/common.service";

abstract class EcommAbstractServices {
  protected db = db;
  public manageFile = new ManageFile();
  public commonService = new CommonService();
}

export default EcommAbstractServices;
