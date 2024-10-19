import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminClientService extends AdminAbstractServices {
  constructor() {
    super();
  }
  // create a client
  public async createClientService(req: Request) {
    const { cl_email, cl_phone } = req.body;
    const checkClient = await this.db("client")
      .select("cl_email", "cl_phone")
      .andWhere({ cl_email })
      .orWhere({ cl_phone });

    if (checkClient.length) {
      if (checkClient[0].cl_email === cl_email) {
        return {
          success: false,
          message: "Already have client with this email",
        };
      } else if (checkClient[0].cl_phone === cl_phone) {
        return {
          success: false,
          message: "Already have client with this phone",
        };
      }
    }
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length) {
      req.body[files[0]?.fieldname] = files[0]?.filename;
    }

    const res = await this.db("client").insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: "Client has been created",
      };
    } else {
      return {
        success: false,
        message: "Cannot create client",
      };
    }
  }

  // get all client
  public async getAllClientService(req: Request) {
    const {
      status,
      cl_name,
      address,
      cl_email,
      cl_phone,
      limit,
      skip,
      order_by = "cl_name",
      according_order = "asc",
    } = req.query;

    const dtbs = this.db("client AS cl");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const category = await dtbs
      .select(
        "cl_id",
        "cl_type",
        "cl_name",
        "cl_image",
        "cl_email",
        "w_name",
        "cl_status"
      )
      .join("warehouse AS wh", "cl.cl_w_id", "wh.w_id")
      .where(function () {
        if (status) {
          this.andWhere("cl.cl_status", status);
        }
        if (cl_name) {
          this.andWhere("cl.cl_name", "Like", `%${cl_name}%`);
        }
        if (cl_email) {
          this.andWhere("cl.cl_email", "Like", `%${cl_email}%`);
        }
        if (cl_phone) {
          this.andWhere("cl.cl_phone", "Like", `%${cl_phone}%`);
        }
        if (address) {
          this.andWhere("cl.cl_address", address);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = await this.db("client AS cl")
      .count("cl_id AS total")
      .where(function () {
        if (status) {
          this.andWhere("cl.cl_status", status);
        }
        if (cl_name) {
          this.andWhere("cl.cl_name", "Like", `%${cl_name}%`);
        }
        if (cl_email) {
          this.andWhere("cl.cl_email", "Like", `%${cl_email}%`);
        }
        if (cl_phone) {
          this.andWhere("cl.cl_phone", "Like", `%${cl_phone}%`);
        }
        if (address) {
          this.andWhere("cl.cl_address", address);
        }
      });

    return {
      success: true,
      data: category,
      total: count[0].total,
    };
  }

  // get single client
  public async getSingleClientService(req: Request) {
    const { id } = req.params;

    const data = await this.db("client AS cl")
      .select(
        "cl.cl_id",
        "cl.cl_type",
        "cl.cl_name",
        "cl.cl_address",
        "cl.cl_image",
        "cl.cl_phone",
        "cl.cl_email",
        "cl.cl_contact_name",
        "cl.cl_contact_phone",
        "cl.cl_status",
        "cl.cl_created_at",
        "wh.w_id",
        "wh.w_name",
        "wh.w_address",
        "wh.w_phone",
        "wh.w_email",
        "ar.ar_name_ar",
        "ar.ar_name_en",
        "ar.ar_url",
        "sc.scit_name_en",
        "sc.scit_name_ar",
        "sc.scit_url",
        "ct.cit_name_en",
        "ct.cit_name_ar",
        "ct.cit_lat",
        "ct.cit_lon",
        "ct.cit_url",
        "pv.pro_name_en",
        "pv.pro_name_ar",
        "pv.pro_url",
        "cnt.c_name_en",
        "cnt.c_name_ar"
      )
      .join("warehouse AS wh", "cl.cl_w_id", "wh.w_id")
      .join("area AS ar", "cl.cl_ar_id", "ar.ar_id")
      .join("sub_city AS sc", "ar.ar_scit_id", "sc.scit_id")
      .join("city AS ct", "sc.scit_cit_id", "ct.cit_id")
      .join("province AS pv", "ct.cit_pro_id", "pv.pro_id")
      .join("country AS cnt", "pv.pro_c_id", "cnt.c_id")

      .where({ cl_id: id });

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: "No client found with this id",
      };
    }
  }

  // update single client
  public async updateClientService(req: Request) {
    const { id } = req.params;
    const checkClient = await this.db("client")
      .select("cl_name")
      .where({ cl_id: id });

    if (!checkClient.length) {
      return {
        success: false,
        message: "Client not found with this id",
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length) {
      req.body[files[0]?.fieldname] = files[0]?.filename;
    }

    console.log(req.body);
    const res = await this.db("client").update(req.body).where({ cl_id: id });

    console.log({ res });

    if (res) {
      return {
        success: true,
        data: "Client updated successfully",
      };
    } else {
      return {
        success: false,
        message: "Cannot update client",
      };
    }
  }
}

export default AdminClientService;
