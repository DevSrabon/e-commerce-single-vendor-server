import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminWareHouseService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create a warehouse
  public async createWarehouseService(req: Request) {
    const { w_name, type } = req.body;
    const { au_id } = req.user;
    const checkWarehouse = await this.db("warehouse")
      .select("w_name")
      .where({ w_name });

    if (checkWarehouse.length) {
      return {
        success: false,
        message: "Already have warehouse with this name",
      };
    }

    const res = await this.db("warehouse").insert({
      ...req.body,
    });

    if (res.length) {
      return {
        success: true,
        message: "warehouse has been created",
      };
    } else {
      return {
        success: false,
        message: "Cannot create warehouse",
      };
    }
  }

  // get all warehouse
  public async getAllWarehouseService(req: Request) {
    const {
      w_name,
      limit,
      type,
      skip,
      order_by = "w_id",
      according_order = "asc",
    } = req.query;

    const dtbs = this.db("warehouse AS w");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select("w.*")

      .where(function () {
        if (w_name) {
          this.andWhere("w_name", "Like", `%${w_name}%`);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = await this.db("warehouse")
      .count("w_id AS total")
      .where(function () {
        if (w_name) {
          this.andWhere("w_name", "Like", `%${w_name}%`);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  // get single warehouse
  public async getSingleWarehouseService(req: Request) {
    const { id } = req.params;

    const warehouseInfo = await this.db("warehouse")
      .select("*")
      .where({ w_id: id });

    const products = await this.db("inventory_view AS iv")
      .select(
        "iv.i_p_id AS p_id",
        "pv.p_name_en",
        "pv.p_status",
        "iv.i_quantity_available AS quantity_available",
        "iv.i_quantity_sold AS quantity_sold"
        // "iv.inventory_attribute"
      )
      .leftJoin("product_view AS pv", "iv.i_p_id", "pv.p_id")
      .where("iv.i_w_id", id);

    if (warehouseInfo.length) {
      return {
        success: true,
        data: {
          warehouseInfo: warehouseInfo[0],
          products,
        },
      };
    } else {
      return {
        success: false,
        message: "No store found with this id",
      };
    }
  }

  // update single warehouse
  public async updateWarehouseService(req: Request) {
    const { id } = req.params;
    const checkWarehouse = await this.db("warehouse")
      .select("w_id")
      .where({ w_id: id });

    if (!checkWarehouse.length) {
      return {
        success: false,
        message: "store not found with this id",
      };
    }

    const res = await this.db("location").update(req.body).where({ w_id: id });

    if (res) {
      return {
        success: true,
        data: "location updated successfully",
      };
    } else {
      return {
        success: false,
        message: "location update staff",
      };
    }
  }
}

export default AdminWareHouseService;
