import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminNotificationService extends AdminAbstractServices {
  constructor() {
    super();
  }

  public async getAllNotificationService(req: Request) {
    const { read_status, skip, limit } = req.query;

    const data = await this.db("admin_notification")
      .select("*")
      .where(function () {
        if (read_status) {
          this.where("read_status", read_status);
        }
      })
      .orderBy("id", "desc")
      .offset(Number(skip) || 0)
      .limit(Number(limit) || 10);

    const total = await this.db("admin_notification")
      .count({ total: "*" })
      .where(function () {
        if (read_status) {
          this.where("read_status", read_status);
        }
      })
      .first();

    return {
      success: true,
      data,
      total: total?.total || 0,
    };
  }

  public async updateNotificationService(req: Request) {
    const { id } = req.params;
    const checkNotification = await this.db("admin_notification")
      .where({ id })
      .first();
    if (!checkNotification) {
      return {
        success: false,
        message: "No notification found",
      };
    }
    const data = await this.db("admin_notification")
      .update({ read_status: 1 })
      .where("id", id);
    return {
      success: true,
      message: "Successfully updated",
    };
  }

  //  delete all mail
  public async deleteAllNotificationService() {
    const data = await this.db("admin_notification").del();
    return {
      success: true,
      message: "Successfully Deleted",
    };
  }
}

export default AdminNotificationService;
