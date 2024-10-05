import { Router } from "express";
import AdminRouter from "../appAdmin/admin.router";
import EcommRouter from "../appEcommerce/ecomm.router";
import CommonRouter from "../common/commonRouter/common.router";
import AdminAuthChecker from "../common/middlewares/authChecker/adminAuthChecker";

class RootRouter {
  public v1Router = Router();
  private adminRouter = new AdminRouter();
  private commonRouter = new CommonRouter();
  private ecommrouter = new EcommRouter();
  constructor() {
    this.callV1Router();
  }

  private callV1Router() {
    this.v1Router.use("/common", this.commonRouter.router);
    this.v1Router.use("/admin", this.adminRouter.AdminRouter);
    this.v1Router.use("/ecomm", this.ecommrouter.EcommRouter);
  }
}

export default RootRouter;
