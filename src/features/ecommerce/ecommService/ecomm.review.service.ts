import { Request } from "express";
import CustomError from "../../../utils/lib/customError";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommReviewService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // create review service
  public async createReviewService(req: Request) {
    const { rating, product_id, id, comment, order_id } = req.body;
    const { ec_id } = req.customer;
    const files = (req.files as Express.Multer.File[]) || [];
    const checkOrder = await this.db("e_order")
      .select("id")
      .andWhere("id", order_id)
      .andWhere("ec_id", ec_id)
      .first();
    if (!checkOrder) {
      return {
        success: false,
        message: "You haven't order this product!",
      };
    }
    if (!req.body.parent_id) {
      const check = await this.db("e_product_review as epr")
        .select("*")
        .where((qb) => {
          qb.andWhereNot("epr.parent_id", null);
          qb.andWhere("epr.eo_id", order_id);
          qb.andWhere("epr.ec_id", ec_id);
          qb.andWhere("epr.p_id", product_id);
        });

      if (check.length) {
        return {
          success: false,
          message: "You already review to this product",
        };
      }
    }
    let productReviewPayload = {} as {
      ec_id: number;
      p_id: number;
      eo_id: number;
      comment?: string;
      parent_id?: number;
      rating?: number;
    };
    if (id) {
      const checkParent = await this.db("e_product_review")
        .select("id")
        .where("id", id)
        .first();
      if (!checkParent)
        return {
          success: false,
          message: "No Review Find for review",
        };
      productReviewPayload = {
        ec_id: ec_id,
        p_id: product_id,
        comment: comment,
        parent_id: id,
        rating: rating,
        eo_id: order_id,
      };
    } else {
      productReviewPayload = {
        ec_id: ec_id,
        p_id: product_id,
        comment: comment,
        rating: rating,
        eo_id: order_id,
      };
    }

    const res = await this.db("e_product_review").insert(productReviewPayload);

    if (files.length) {
      const reviewImage: { image: string; epr_id: number }[] = files.map(
        (item) => {
          return { image: item.filename, epr_id: res[0] };
        }
      );
      await this.db("epr_image").insert(reviewImage);
    }

    return {
      success: true,
      message: "Review added successfully",
    };
  }

  // Like or dislike
  public async addLikeOrDislike(req: Request) {
    const { id, type } = req.body;
    const { ec_id } = req.customer;
    const checkReview = await this.db("e_product_review")
      .select("id", "p_id")
      .where("id", id)
      .first();
    if (!checkReview)
      return {
        success: false,
        message: "No Review Found!",
      };

    const check = await this.db("erp_like_dislike")
      .select("id", "count")
      .andWhere("review_id", id)
      .andWhere("customer_id", ec_id)
      .andWhere({ type })
      .first();
    if (!check) {
      await this.db("erp_like_dislike").insert({
        count: 1,
        type,
        customer_id: ec_id,
        review_id: id,
      });
    } else {
      if (check.count) {
        await this.db("erp_like_dislike")
          .decrement("count", 1)
          .andWhere("review_id", id)
          .andWhere("customer_id", ec_id)
          .andWhere({ type });
      } else {
        await this.db("erp_like_dislike")
          .increment("count", 1)
          .andWhere("review_id", id)
          .andWhere("customer_id", ec_id)
          .andWhere({ type });
      }
    }

    return {
      success: true,
      message: `Successfully ${check?.count ? "un" : ""}${type}d`,
    };
  }

  // get review of a product
  public async getReviewOfProductService(req: Request) {
    const { id } = req.params;

    const { ec_id } = req.customer;

    const data = await this.db("p_review_view as epr")
      .select(
        "epr.*",
        this.db.raw(
          `(COALESCE((SELECT SUM(eld.count)
                      FROM erp_like_dislike AS eld
                      WHERE eld.review_id = epr.id
                        AND eld.type = 'like'), 0)) AS likes`
        ),
        this.db.raw(
          `(COALESCE((SELECT SUM(eld.count)
                      FROM erp_like_dislike AS eld
                      WHERE eld.review_id = epr.id
                        AND eld.type = 'dislike'), 0)) AS dislikes`
        ),
        this.db.raw(
          `(CASE
              WHEN EXISTS (
                SELECT 1
                FROM erp_like_dislike AS eld
                WHERE eld.customer_id = ?
                  AND eld.review_id = epr.id
                  AND eld.type = 'like'
                  AND eld.count = 1
              )
              THEN TRUE
              ELSE FALSE
            END) AS isMyLike`,
          [ec_id]
        ),
        this.db.raw(
          `(CASE
              WHEN EXISTS (
                SELECT 1
                FROM erp_like_dislike AS eld
                WHERE eld.customer_id = ?
                  AND eld.review_id = epr.id
                  AND eld.type = 'dislike'
                  AND eld.count = 1
              )
              THEN TRUE
              ELSE FALSE
            END) AS isMyDislike`,
          [ec_id]
        )
      )
      .where("epr.product_id", id)
      .andWhere("epr.status", 1);

    if (!data || data.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const comments: any[] = [];
    const map: Record<number, any> = {};

    // Create a map of all reviews for quick lookup
    for (const review of data) {
      review.children = [];
      map[review.id] = review;
    }

    for (const review of data) {
      if (review.parent_id) {
        if (map[review.parent_id]) {
          map[review.parent_id].children.push(review);
        }
      } else {
        comments.push(review);
      }
    }

    return {
      success: true,
      data: comments,
    };
  }

  // get review of customer
  public async getReviewOfCustomerService(id: number) {
    const data = await this.db("p_review_view")
      .select("*")
      .whereNotNull("parent_id")
      .andWhere("customer_id", id)
      .andWhere("status", 1);

    return {
      success: true,
      data,
    };
  }

  // update review
  public async updateReviewService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { removeImages, ...body } = req.body;
      const { id } = req.params;
      const { ec_id } = req.customer;

      const check = await trx("e_product_review as epr")
        .select("id")
        .where((qb) => {
          qb.andWhere("epr.ec_id", ec_id);
          qb.andWhere("epr.id", id);
        })
        .first();

      if (!check) {
        throw new CustomError(
          "You can't edit other's review",
          412,
          "Unprocessable Entity"
        );
      }
      const files = req.files as Express.Multer.File[] | [];

      if (files && files.length) {
        const reviewImage: { image: string; epr_id: number }[] = files.map(
          (item) => {
            return { image: item.filename, epr_id: +id };
          }
        );
        await trx("epr_image").insert(reviewImage);
      }
      if (removeImages) {
        const parsedRemoveImages: number[] = JSON.parse(removeImages);
        console.log(
          "🚀 ~ EcommReviewService ~ returnawaitthis.db.transaction ~ parsedRemoveImages:",
          parsedRemoveImages
        );
        const checkImages = await trx("epr_image")
          .select("id", "image")
          .whereIn("id", parsedRemoveImages);
        if (!checkImages.length) {
          throw new CustomError(
            "Images are not found to remove",
            412,
            "Unprocessable Entity"
          );
        }
        if (checkImages.length !== parsedRemoveImages.length) {
          throw new CustomError(
            "Some Images are not found to remove",
            412,
            "Unprocessable Entity"
          );
        }
        await trx("epr_image").delete().whereIn("id", parsedRemoveImages);
        await this.manageFile.deleteFromStorage(
          checkImages.map((img) => img.image)
        );
      }
      console.log("============", Object.keys(body));
      if (Object.keys(body).length) {
        await trx("e_product_review").update(body).where("id", id);
      }
      return {
        success: true,
        message: "successfully updated",
      };
    });
  }

  // delete Review
  public async deleteReviewService(id: string | number, ec_id: number) {
    const check = await this.db("e_product_review")
      .select("id")
      .andWhere("id", id)
      .first()
      .andWhere("ec_id", ec_id);
    if (!check) {
      return {
        success: false,
        message: "Review Not found",
      };
    }
    const res = await this.db("e_product_review")
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
        "eo.id as order_id",
        "ep.p_name as name",
        "ep.p_slug as slug",
        "ep.p_images as images"
      )
      .join("e_order as eo", "eod.id", "eo.id")
      .join("product_view as ep", "eod.ep_id", "ep.ep_id")
      .leftJoin("product_review as epr", "eod.ep_id", "epr.ep_id")
      .andWhere("eo.status", "delivered")
      .andWhere("eo.ec_id", ec_id)
      .andWhere("epr.ec_id", null);

    return {
      success: true,
      data,
    };
  }
}

export default EcommReviewService;
