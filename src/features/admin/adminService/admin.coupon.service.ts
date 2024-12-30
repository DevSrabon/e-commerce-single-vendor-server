import { Request } from "express";
import CommonService from "../../common/commonService/common.service";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
class AdminCouponService extends AdminAbstractServices {
  constructor() {
    super();
  }
  public async createCoupon(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { au_id } = req.user;
      const { coupon_code, p_ids, ...rest } = req.body;

      const checkCoupon = await this.db("coupons")
        .select("id")
        .where({ coupon_code })
        .andWhereRaw("CURRENT_DATE BETWEEN ?? AND ??", [
          "start_date",
          "end_date",
        ]);
      if (checkCoupon.length) {
        return {
          success: false,
          message: "coupon code or date range already exists",
        };
      }

      const insertCoupon = await this.db("coupons").insert({
        coupon_code,
        created_by: au_id,
        ...rest,
      });
      if (p_ids.length && rest.coupon_type === "specific") {
        const checkProduct = await this.db("product")
          .select("p_id")
          .whereIn("p_id", p_ids);
        if (checkProduct?.length !== p_ids.length) {
          return {
            success: false,
            message: "Products are not found",
          };
        }
        const couponProductPayload = p_ids.map((p_id: number) => {
          return {
            coupon_id: insertCoupon[0],
            p_id,
          };
        });
        await this.db("coupon_product").insert(couponProductPayload);
      }
      if (insertCoupon.length) {
        await new CommonService().createAuditTrailService({
          at_admin_id: au_id,
          at_details: `An coupon has been created, ${coupon_code}`,
        });
        return {
          success: true,
          message: "Coupon has been created successfully!",
        };
      } else {
        return {
          success: false,
          message: "Coupon creation has been failed!",
        };
      }
    });
  }

  public async getAll(req: Request) {
    const {
      skip = 0,
      limit = 100,
      coupon_code,
      sort = "created_at",
      order = "desc",
    } = req.query;

    const coupons = await this.db("coupons")
      .select("*")
      .where(function () {
        if (coupon_code) {
          this.where("coupon_code", "like", `%${coupon_code}%`);
        }
      })
      .orderBy(sort as string, order as string)
      .offset(Number(skip))
      .limit(Number(limit));

    const totalCoupons = await this.db("coupons")
      .count({ total: "*" })
      .where(function () {
        if (coupon_code) {
          this.where("coupon_code", "like", `%${coupon_code}%`);
        }
      })
      .first();

    return {
      success: true,
      data: coupons,
      total: totalCoupons?.total || 0,
    };
  }

  public async getSingle(req: Request) {
    const { id } = req.params;

    const coupon = await this.db("coupons").where({ id }).first();
    if (!coupon) {
      return {
        success: false,
        message: "Coupon not found",
      };
    }
    return {
      success: true,
      data: {
        ...coupon,
      },
    };
  }

  public async updateSingle(req: Request) {
    const { id } = req.params;
    const { ...rest } = req.body;

    const existingCoupon = await this.db("coupons").where({ id }).first();
    if (!existingCoupon) {
      return {
        success: false,
        message: "Coupon not found",
      };
    }
    if (rest.coupon_code) {
      // Check for duplicate coupon names
      const checkCoupon = await this.db("coupons")
        .select("id")
        .where(function () {
          this.where({ coupon_code: rest.coupon_code });
        });

      if (checkCoupon.length) {
        return {
          success: false,
          message: "Coupon code already exists",
        };
      }
    }

    await this.db("coupons")
      .where({ id })
      .update({
        ...rest,
      });
    await new CommonService().createAuditTrailService({
      at_admin_id: req.user.au_id,
      at_details: `Coupon has been updated: ${JSON.stringify(
        existingCoupon
      )}, updated data:${JSON.stringify(req.body)}`,
    });

    return {
      success: true,
      message: "Coupon updated successfully",
    };
  }

  public async delete(req: Request) {
    const { id } = req.params;

    const existingCoupon = await this.db("coupons").where({ id }).first();

    if (!existingCoupon) {
      return {
        success: false,
        message: "Coupon not found",
      };
    }

    await this.db("coupons").where({ id }).delete();
    const checkCouponProduct = await this.db("coupon_product")
      .select("coupon_id")
      .where({ coupon_id: id });
    if (checkCouponProduct.length) {
      await this.db("coupon_product").where({ coupon_id: id }).delete();
    }
    await new CommonService().createAuditTrailService({
      at_admin_id: req.user.au_id,
      at_details: `Coupon has been deleted: ${existingCoupon.coupon_code}`,
    });

    return {
      success: true,
      message: "Coupon deleted successfully",
    };
  }
}

export default AdminCouponService;
