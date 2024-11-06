import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
import { IorderUpdateBody, customRequest } from "../utils/types/combinedTypes";

class AdminEcommerceOrderService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce order
  public async getAllEorderService(req: Request) {
    const { from_date, to_date, order_no, country_id, limit, skip, status } =
      req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("order_view AS eo");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "eo.id",
        "eo.order_no",
        "eo.status",
        "eo.grand_total",
        "eo.created_at",
        "eo.customer_name",
        "eo.customer_email",
        "eo.customer_phone"
      )
      .orderBy("eo.created_at", "desc")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("eo.created_at", [from_date as string, endDate]);
        }
        if (order_no) {
          this.andWhere("eo.order_no", "like", `%${order_no}%`);
        }
        if (country_id) {
          this.andWhere("ec.country_id", country_id);
        }
        if (status) {
          this.andWhere("eo.status", status);
        }
      });

    const count = await this.db("order_view AS eo")
      .count("eo.id AS total")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("eo.created_at", [from_date as string, endDate]);
        }
        if (order_no) {
          this.andWhere("eo.order_no", "like", `%${order_no}%`);
        }
        if (country_id) {
          this.andWhere("ec.country_id", country_id);
        }
        if (status) {
          this.andWhere("eo.status", status);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  // get single ecommerce order
  public async getSingleEorderService(req: Request) {
    const { id } = req.params;

    const data = await this.db("order_view").where("id", id);

    if (data.length) {
      return {
        success: true,
        data,
      };
    } else {
      return {
        success: false,
        message: "Order doesn't found with this id",
      };
    }
  }
  // public async getSingleEorderService(req: Request) {
  //   const { id } = req.params;

  //   const data = await this.db("e_order AS eo")
  //     .select(
  //       "eo.id",
  //       "eo.status",
  //       "eo.currency",
  //       "eo.payment_status",
  //       "eo.total",
  //       "eo.discount",
  //       "eo.delivery_charge",
  //       "eo.grand_total",
  //       "eo.remarks",
  //       "eo.created_at",
  //       "eo.updated_at",
  //       "ec.ec_id",
  //       "ec.ec_name",
  //       "ec.ec_phone",
  //       "ec.ec_email",
  //       "esa.name as address_name",
  //       "esa.phone as address_phone",
  //       "esa.apt as address_apt",
  //       "esa.street_address as address_street_address",
  //       "esa.label as address_label",
  //       "esa.city as address_city",
  //       "esa.zip_code as address_zip_code",
  //       "esa.state as address_state",
  //       "esa.country_id as address_country_id"
  //     )
  //     .leftJoin("e_customer AS ec", "eo.ec_id", "ec.ec_id")
  //     .leftJoin("ec_shipping_address AS esa", "eo.ecsa_id", "esa.id")
  //     .leftJoin("country AS c", "esa.country_id", "c.c_id")
  //     .where("eo.id", id);

  //   const order_details = await this.db("e_order_details AS eod")
  //     .select(
  //       "eod.id",
  //       "eod.eo_id",
  //       "eod.ep_id",
  //       "eod.ep_name_en",
  //       "eod.ep_name_ar",
  //       "eod.price",
  //       "eod.quantity",
  //       "eod.v_id",
  //       "eod.size_id",
  //       "eod.p_color_id",
  //       "eod.created_at",
  //       "f.name_en as fabric_name_en",
  //       "f.name_ar as fabric_name_ar",
  //       "f.details_en as fabric_details_en",
  //       "f.details_ar as fabric_details_ar",
  //       "sz.size",
  //       this.db.raw(`CONCAT(sz.height, sz.attribute) AS height`),
  //       this.db.raw(`CONCAT(sz.weight, sz.attribute) AS weight`),
  //       "sz.details as size_details",
  //       "cl.color_en as color_en",
  //       "cl.color_ar as color_ar",
  //       "cl.details_en as color_details_en",
  //       "cl.details_ar as color_details_ar",
  //       this.db.raw(`
  //         (
  //           SELECT JSON_ARRAYAGG(ci.image)
  //           FROM color_image AS ci
  //           WHERE ci.p_color_id = pc.id
  //         ) AS color_images
  //       `)
  //     )
  //     .leftJoin("variant_product AS v", "eod.v_id", "v.id")
  //     .leftJoin("fabric as f", "v.fabric_id", "f.id")
  //     .leftJoin("size AS sz", "eod.size_id", "sz.id")
  //     .leftJoin("p_color AS pc", "eod.p_color_id", "pc.id")
  //     .leftJoin("color AS cl", "pc.color_id", "cl.id")
  //     .where("eod.eo_id", id);

  //   const order_tracking_status = await this.db("e_order_tracking")
  //     .select("status", "details", "date_time")
  //     .where({ id: id });

  //   if (data.length) {
  //     return {
  //       success: true,
  //       data: { ...data[0], order_details, order_tracking_status },
  //     };
  //   } else {
  //     return {
  //       success: false,
  //       message: "Order doesn't found with this id",
  //     };
  //   }
  // }

  // update single ecommerce order
  public async updateSingleEorderPaymentService(
    req: customRequest<IorderUpdateBody>
  ) {
    return await this.db.transaction(async (trx) => {
      const { payment_status } = req.body;
      const { id } = req.params;

      const checkOrder = await trx("e_order")
        .select("id")
        .andWhereNot({ status: "delivered" })
        .where({ id: id });

      if (checkOrder.length) {
        return {
          success: false,
          message: "You cannot payment cause, this order has not delivered",
        };
      }

      const checkPayment = await trx("e_order")
        .select("id")
        .andWhere({ id: id })
        .andWhere({ payment_status: 1 });

      if (checkPayment.length) {
        return {
          success: false,
          message: "Already payment has been done",
        };
      }

      let response: { success: boolean; message: string } = {
        success: false,
        message: "",
      };

      const res = await trx("e_order")
        .update({
          payment_status,
        })
        .where({ id: id });

      if (res) {
        response = {
          success: true,
          message: "Order payment has been updated",
        };
      } else {
        response = {
          success: true,
          message: "Order payment cannot update right now",
        };
      }

      return {
        ...response,
      };
    });
  }

  // update
  public async updateSingleEorderTrackingService(
    req: customRequest<IorderUpdateBody>
  ) {
    return await this.db.transaction(async (trx) => {
      console.log("ht");
      const { status, details, remarks } = req.body;
      const { orderId } = req.params;

      let response: { success: boolean; message: string } = {
        success: false,
        message: "",
      };

      if (status === "rejected") {
        const res = await trx("e_order")
          .update({
            status,
            remarks,
          })
          .where({ id: orderId });

        if (res) {
          response = {
            success: true,
            message: "Order rejected",
          };
        } else {
          response = {
            success: true,
            message: "Order cannot rejected right now",
          };
        }
      } else {
        if (status === "delivered") {
          const eOrderBody = {
            id: orderId,
            status: status,
            details: remarks && remarks,
          };

          const orderTrackingRes = await trx("e_order_tracking").insert(
            eOrderBody
          );

          // e-order status updating
          const orderRes = await trx("e_order")
            .update({ status, remarks })
            .where({ id: orderId });

          if (orderTrackingRes) {
            response = {
              success: true,
              message: "Order rejected",
            };
          } else {
            response = {
              success: true,
              message: "Order cannot rejected right now",
            };
          }
        } else {
          const eOrderBody = {
            id: orderId,
            status: status,
            details: remarks && remarks,
          };

          const orderTrackingRes = await trx("e_order_tracking").insert(
            eOrderBody
          );

          if (orderTrackingRes) {
            response = {
              success: true,
              message: "Order rejected",
            };
          } else {
            response = {
              success: true,
              message: "Order cannot rejected right now",
            };
          }
        }
      }

      return {
        ...response,
      };
    });
  }
}

export default AdminEcommerceOrderService;
