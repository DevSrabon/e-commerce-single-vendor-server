import { Router } from "express";
import AdminRouter from "../appAdmin/admin.router";
import EcommRouter from "../appEcommerce/ecomm.router";
import CommonRouter from "../common/commonRouter/common.router";
import Webhooks from "../webhooks/webhook";

class RootRouter {
  public v1Router = Router();
  private adminRouter = new AdminRouter();
  private commonRouter = new CommonRouter();
  private ecommrouter = new EcommRouter();
  private webhook = new Webhooks();
  constructor() {
    this.callV1Router();
  }

  private callV1Router() {
    this.v1Router.use("/common", this.commonRouter.router);
    this.v1Router.use("/admin", this.adminRouter.AdminRouter);
    this.v1Router.use("/ecomm", this.ecommrouter.EcommRouter);
    this.v1Router.post("/webhook", this.webhook.stripeWebhook);
  }
}

export default RootRouter;
