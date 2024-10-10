import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminInventoryService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get all inventory
  public async getAllInventoryService(req: Request) {
    const {
      w_id,
      w_type,
      p_name,
      limit,
      skip,
      order_by = "i_id",
      according_order = "asc",
    } = req.query;

    const dtbs = this.db("inventory_view AS iv");
    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "iv.i_id",
        "iv.i_p_id AS p_id",
        "pv.p_name_en",
        "pv.p_name_ar",
        "iv.i_quantity_available AS available_stock",
        "pv.p_images",
        "w.w_id",
        "w.w_name"
      )
      .leftJoin("product_view AS pv", "iv.i_p_id", "pv.p_id")
      .leftJoin("location AS w", "iv.i_w_id", "w.w_id")
      .where(function () {
        if (w_id) {
          this.andWhere("iv.i_w_id", w_id).andWhere(function () {
            if (w_type) {
              this.andWhere("w.w_type", w_type);
            }
          });
        }
        if (p_name) {
          this.andWhere("pv.p_name", "Like", `%${p_name}%`);
        }
      });

    return {
      success: true,
      data,
      // total: count[0].total,
    };
  }

  // get single inventory product
  public async getSingleInventoryService(req: Request) {
    const { id } = req.params;

    const data = await this.db("inventory_view AS iv")
      .select(
        "w.w_id",
        "w.w_name",
        "pv.p_id",
        "pv.p_name",
        "pv.p_slug",
        "pv.p_unit",
        "pv.p_tags",
        "pv.p_details",
        "pv.p_status",
        "pv.s_id",
        "pv.s_name",
        "pv.s_image",
        "iv.i_quantity_available",
        "pv.categories",
        "pv.p_images",
        "pv.p_attribute",
        "inventory_attribute"
      )
      .leftJoin("product_view AS pv", "iv.i_p_id", "pv.p_id")
      .leftJoin("warehouse AS w", "iv.i_w_id", "w.w_id")
      .where("iv.i_id", id);

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: "Cannot found single inventory product with this id",
      };
    }
  }
}

export default AdminInventoryService;
