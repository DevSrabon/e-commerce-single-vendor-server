import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminEcommerceReviewService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce review
  public async getAllEreviewService(req: Request) {
    const { from_date, to_date, limit, skip, parent, status } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("p_review_view AS prv");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "id",
        "rating",
        "parent_id",
        "comment",
        "status",
        "created_at",
        "product_id",
        "product_name_en",
        "customer_id",
        "customer_name",
        "customer_image"
      )
      .where(function () {
        if (Number(parent) === 0) {
          this.andWhere("prv.parent_id", null);
        }
        if (from_date && to_date) {
          this.andWhereBetween("prv.created_at", [
            from_date as string,
            endDate,
          ]);
        }

        if (status) {
          this.andWhere("prv.status", status);
        }
      })
      .orderBy("id", "desc");

    const count = await this.db("p_review_view AS prv")
      .count("prv.id AS total")
      .where(function () {
        if (Number(parent) === 0) {
          this.andWhere("prv.parent_id", null);
        }
        if (from_date && to_date) {
          this.andWhereBetween("prv.created_at", [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere("prv.status", status);
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

    const data = await this.db("p_review_view AS prv")
      .select("*")
      .where("prv.id", id);

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: "Review does not found with this id",
      };
    }
  }

  // delete Review
  public async deleteReviewService(req: Request) {
    const { id } = req.params;
    const check = await this.db("e_product_review")
      .select("id")
      .andWhere("id", id)
      .first();
    if (!check) {
      return {
        success: false,
        message: "Review Not found",
      };
    }
    const res = await this.db("e_product_review")
      .update({ status: 0 })
      .andWhere("id", id);

    if (res) {
      return {
        success: true,
        message: "Review deleted successfully",
      };
    } else {
      return {
        success: false,
        message: "Invalid review",
      };
    }
  }
}

export default AdminEcommerceReviewService;
