import { db } from "../../../app/database";
import ManageFile from "../../../utils/lib/manageFile";
import CommonService from "../../common/commonService/common.service";

abstract class AdminAbstractServices {
  protected db = db;
  protected createAuditTrail = new CommonService().createAuditTrailService;
  public manageFile = new ManageFile();
}

export default AdminAbstractServices;
