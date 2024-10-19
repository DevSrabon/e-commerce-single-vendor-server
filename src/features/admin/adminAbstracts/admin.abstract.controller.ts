import CustomError from "../../../utils/lib/customError";
import Wrapper from "../../common/middlewares/asyncWrapper/wrapper";

abstract class AdminAbstractController {
  protected asyncWrapper: Wrapper;
  constructor() {
    this.asyncWrapper = new Wrapper();
  }

  protected error(message?: string, status?: number, type?: string) {
    throw new CustomError(
      message || "Something went wrong",
      status || 500,
      type || "Internal server Error"
    );
  }
}
export default AdminAbstractController;
