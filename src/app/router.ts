import { Router } from "express";
import AdminRouter from "../features/admin/admin.router";
import ChatRouters from "../features/chats/routers/chat.routers";
import CommonRouter from "../features/common/commonRouter/common.router";
import EcommRouter from "../features/ecommerce/ecomm.router";

class RootRouter {
  public v1Router = Router();
  private adminRouter = new AdminRouter();
  private commonRouter = new CommonRouter();
  private ecommrouter = new EcommRouter();
  private chatRouter = new ChatRouters();

  constructor() {
    this.callV1Router();
  }

  private callV1Router() {
    this.v1Router.use("/common", this.commonRouter.router);
    this.v1Router.use("/admin", this.adminRouter.AdminRouter);
    this.v1Router.use("/ecomm", this.ecommrouter.EcommRouter);
    this.v1Router.use("/chat", this.chatRouter.router);
  }
}

export default RootRouter;
