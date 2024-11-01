import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
import { IorderUpdateBody, customRequest } from "../utils/types/combinedTypes";

class AdminEcommerceOrderService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce order
  public async getAllEorderService(req: Request) {
    const {
      from_date,
      to_date,
      area_id,
      sub_city,
      city,
      province,
      limit,
      skip,
      status,
    } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("e_order AS eo");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "eo.id",
        "eo.status",
        "eo.grand_total",
        "eo.created_at",
        "ec.ec_name",
        "ec.ec_id",
        "ec_image",
        "esa.street_address",
        "eo.created_at"
      )
      .join("e_customer AS ec", "eo.ec_id", "ec.ec_id")
      .join("ec_shipping_address AS esa", "eo.ecsa_id", "esa.id")
      .orderBy("eo.created_at", "desc")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("eo.created_at", [from_date as string, endDate]);
        }

        if (area_id) {
          this.andWhere("av.area_id", area_id);
        }
        if (sub_city) {
          this.andWhere("av.sub_city_id", sub_city);
        }
        if (city) {
          this.andWhere("av.city_id", city);
        }
        if (province) {
          this.andWhere("av.province_id", province);
        }
        if (status) {
          this.andWhere("eo.status", status);
        }
      });

    const count = await this.db("e_order AS eo")
      .count("eo.id AS total")
      .join("e_customer AS ec", "eo.ec_id", "ec.ec_id")
      .join("ec_shipping_address AS esa", "eo.id", "esa.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("eo.created_at", [from_date as string, endDate]);
        }

        if (area_id) {
          this.andWhere("av.area_id", area_id);
        }
        if (sub_city) {
          this.andWhere("av.sub_city_id", sub_city);
        }
        if (city) {
          this.andWhere("av.city_id", city);
        }
        if (province) {
          this.andWhere("av.province_id", province);
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

    const data = await this.db("e_order AS eo")
      .select(
        "eo.id",
        "eo.status",
        "eo.payment_status",
        "eo.total",
        "eo.discount",
        "eo.delivery_charge",
        "eo.grand_total",
        "eo.remarks",
        "eo.created_at",
        "eo.updated_at",
        "ec.ec_id",
        "ec.ec_name",
        "ec.ec_phone",
        "ec.ec_email",
        "esa.label",
        "esa.street_address"
        // "esa.landmark",
        // "av.area_name",
        // "av.sub_city_name",
        // "av.city_name",
        // "av.province_name",
        // "eod.ep_id",
        // "eod.ep_name",
        // "epv.p_images",
        // "eod.price",
        // "eod.quantity",
        // "eod.v_id"
        // "atv.av_value"
      )
      .leftJoin("e_customer AS ec", "eo.ec_id", "ec.ec_id")
      .leftJoin("ec_shipping_address AS esa", "eo.id", "esa.id")
      // .leftJoin("address_view AS av", "esa.ar_id", "av.area_id")
      // .leftJoin("e_order_details AS eod", "eo.id", "eod.id")

      // .leftJoin("product_view AS epv", "eod.ep_id", "epv.ep_id")
      // .leftJoin("attribute_value AS atv", "eod.v_id", "atv.v_id")
      .where("eo.id", id);

    const order_details = await this.db("e_order_details AS eod")
      .select(
        "eod.id",
        "eod.eo_id",
        "eod.ep_id",
        "eod.ep_name_en",
        "eod.ep_name_ar",
        "eod.price",
        "eod.quantity",
        "eod.v_id",
        "eod.size_id",
        "eod.color_id",
        "eod.created_at",
        "f.name_en as fabric_name_en",
        "f.name_ar as fabric_name_ar",
        "f.details_en as fabric_details_en",
        "f.details_ar as fabric_details_ar",
        "sz.size",
        this.db.raw(`CONCAT(sz.height, sz.attribute) AS height`),
        this.db.raw(`CONCAT(sz.weight, sz.attribute) AS weight`),
        "sz.details",
        // "cl.name_en as color_name_en",
        // "cl.name_ar as color_name_ar",
        this.db.raw(`
          (
            SELECT JSON_ARRAYAGG(pi.image)
            FROM color_image AS pi
            WHERE pi.p_color_id = cl.id
          ) AS color_images
        `)
      )
      .leftJoin("variant_product AS v", "eod.v_id", "v.id")
      .leftJoin("fabric as f", "v.fabric_id", "f.id")
      .leftJoin("size AS sz", "eod.size_id", "sz.id")
      .leftJoin("color AS cl", "eod.color_id", "cl.id")
      .where("eod.eo_id", id);

    const order_tracking_status = await this.db("e_order_tracking")
      .select("status", "details", "date_time")
      .where({ id: id });

    if (data.length) {
      return {
        success: true,
        data: { ...data[0], order_details, order_tracking_status },
      };
    } else {
      return {
        success: false,
        message: "Order doesn't found with this id",
      };
    }
  }

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
