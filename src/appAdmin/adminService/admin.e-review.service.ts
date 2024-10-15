import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminEcommerceReviewService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce review
  public async getAllEreviewService(req: Request) {
    const { from_date, to_date, limit, skip, status } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("product_review AS epr");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "id",
        "ec_id",
        "ec_name",
        "ec_image",
        "ep_id",
        "p_name",
        "rating",
        "comment",
        "status"
      )
      .join("e_product_view AS epv", "epr.ep_id", "epv.ep_id")
      .join("e_customer AS ec", "epr.ec_id", "ec.ec_id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("epr.created_at", [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere("epr.status", status);
        }
      })
      .orderBy("id", "desc");

    const count = await this.db("product_review AS epr")
      .count("epr.id AS total")
      .join("e_product_view AS epv", "epr.ep_id", "epv.ep_id")
      .join("e_customer AS ec", "epr.ec_id", "ec.ec_id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("epr.created_at", [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere("epr.status", status);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  //get single ecommerce review
  public async getSingleEreviewService(req: Request) {
    const { id } = req.params;

    const data = await this.db("product_review AS epr")
      .select(
        "id",
        "ec_id",
        "ec_name",
        "ec_image",
        "ep_id",
        "p_name",
        "rating",
        "comment",
        "epri_image",
        "status",
        "created_at"
      )
      .join("e_product_view AS epv", "epr.ep_id", "epv.ep_id")
      .join("e_customer AS ec", "epr.ec_id", "ec.ec_id")
      .leftJoin("image AS epri", "epr.id", "epri.epri_id")
      .where("epr.id", id);

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: "Review doesnot found with this id",
      };
    }
  }
}

export default AdminEcommerceReviewService;
