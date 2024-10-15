import { Request } from "express";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommReviewService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // create review service
  public async createReviewService(req: Request) {
    const { rating, product_id, comment, order_id } = req.body;
    const { ec_id } = req.customer;
    const files = (req.files as Express.Multer.File[]) || [];

    const check = await this.db("product_review as epr")
      .select("*")
      .andWhere("epr.eo_id", order_id)
      .andWhere("epr.ec_id", ec_id)
      .andWhere("epr.ep_id", product_id);

    if (check.length) {
      return {
        success: false,
        message: "You already review to this product",
      };
    }

    const res = await this.db("product_review").insert({
      ec_id: ec_id,
      ep_id: product_id,
      comment: comment,
      rating: rating,
      eo_id: order_id,
    });

    if (files.length) {
      const reviewImage: { epri_image: string; epri_id: number }[] = files.map(
        (item) => {
          return { epri_image: item.filename, epri_id: res[0] };
        }
      );
      await this.db("image").insert(reviewImage);
    }

    return {
      success: true,
      message: "Review added successfully",
    };
  }

  // get review of a product
  public async getReviewOfProductService(id: string | number) {
    const data = await this.db("ep_review_view")
      .select(
        "id",
        "rating",
        "comment",
        "review_images",
        "created_at",
        "customer_id",
        "customer_name"
      )
      .andWhere("product_id", id)
      .andWhere("status", 1);

    return {
      success: true,
      data,
    };
  }

  // get review of customer
  public async getReviewOfCustomerService(id: number) {
    const data = await this.db("ep_review_view")
      .select(
        "id",
        "rating",
        "comment",
        "review_images",
        "created_at",
        "product_id",
        "product_slug",
        "product_name"
      )
      .andWhere("customer_id", id)
      .andWhere("status", 1);

    return {
      success: true,
      data,
    };
  }

  // update review
  public async updateReviewService(req: Request) {}

  // delete Review
  public async deleteReviewService(id: string | number, ec_id: number) {
    const res = await this.db("product_review")
      .update({ status: 0 })
      .andWhere("id", id)
      .andWhere("ec_id", ec_id);

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

  // get to review products
  public async getToReviewProduct(ec_id: number) {
    const data = await this.db("e_order_details as eod")
      .select(
        "ep.ep_id as id",
        "eo.eo_id as order_id",
        "ep.p_name as name",
        "ep.p_slug as slug",
        "ep.p_images as images"
      )
      .join("e_order as eo", "eod.eod_eo_id", "eo.eo_id")
      .join("e_product_view as ep", "eod.eod_ep_id", "ep.ep_id")
      .leftJoin("product_review as epr", "eod.eod_ep_id", "epr.ep_id")
      .andWhere("eo.eo_status", "delivered")
      .andWhere("eo.eo_ec_id", ec_id)
      .andWhere("epr.ec_id", null);

    return {
      success: true,
      data,
    };
  }
}

export default EcommReviewService;
