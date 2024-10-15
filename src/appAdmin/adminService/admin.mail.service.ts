import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminMailService extends AdminAbstractServices {
  constructor() {
    super();
  }

  public async getAllMailService(req: Request) {
    const { email, status, skip, limit } = req.query;

    const data = await this.db("email")
      .select("*")
      .where(function () {
        if (email) {
          this.where("recipient", "like", `%${email}%`);
        }
        if (status) {
          this.where("status", status);
        }
      })
      .orderBy("id", "desc")
      .offset(Number(skip) || 0)
      .limit(Number(limit) || 10);

    const total = await this.db("email").count({ total: "*" }).first();

    return {
      success: true,
      data,
      total: total?.total || 0,
    };
  }

  //   get mail by id
  public async getMailByIdService(req: Request) {
    const { id } = req.params;
    const data = await this.db("email").where("id", id).first();
    return {
      success: true,
      data,
    };
  }

  public async deleteMailService(req: Request) {
    const { id } = req.params;
    const data = await this.db("email").where("id", id).del();
    return {
      success: true,
      data,
    };
  }

  //  delete all mail
  public async deleteAllMailService() {
    const data = await this.db("email").del();
    return {
      success: true,
      data,
    };
  }
}

export default AdminMailService;
