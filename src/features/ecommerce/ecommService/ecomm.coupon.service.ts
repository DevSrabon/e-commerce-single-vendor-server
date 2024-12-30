import { Request } from "express";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommCouponService extends EcommAbstractServices {
  constructor() {
    super();
  }

  public async getCoupon(req: Request) {
    const { p_id } = req.query;

    // Initialize the query to always include overall coupons
    let query = this.db("coupons as c")
      .leftJoin("coupon_product as cp", "c.id", "=", "cp.coupon_id")
      .where("c.status", 1)
      .andWhereRaw("CURRENT_DATE BETWEEN ?? AND ??", [
        "c.start_date",
        "c.end_date",
      ])
      .select("c.*") // Select all columns from coupons table with alias 'c'
      .orderBy("c.id", "desc")
      .limit(5);

    // Always include overall coupons, and if p_id is provided, include specific ones as well
    if (p_id) {
      query = query.andWhere(function () {
        this.where("c.coupon_type", "overall").orWhere("cp.p_id", p_id); // Include both overall and specific coupons for given p_id
      });
    } else {
      query = query.where("c.coupon_type", "overall"); // If no p_id, only include overall coupons
    }

    // Execute the query
    const data = await query;

    return {
      success: true,
      message: "Data successfully fetched",
      data,
    };
  }

  public async getSingle(req: Request) {
    const { id } = req.params;
    const coupon = await this.db("coupons")
      .where({ id })
      .andWhereRaw("CURRENT_DATE BETWEEN ?? AND ??", ["start_date", "end_date"])
      .first();
    if (!coupon) {
      return {
        success: false,
        message: "Coupon not found",
      };
    }
    const couponUsed = await this.db("coupon_applied")
      .where({ coupon_id: id })
      .andWhere("ec_id", req.customer.ec_id)
      .count("id as total");

    if (couponUsed.length && couponUsed[0].total >= coupon.max_use) {
      return {
        success: false,
        message: "Coupon has been already used",
      };
    }
    return {
      success: true,
      data: {
        ...coupon,
      },
    };
  }
}
export default EcommCouponService;
