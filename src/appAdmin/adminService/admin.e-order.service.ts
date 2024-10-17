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
      eo_status,
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
        "eo.eo_id",
        "eo.eo_status",
        "eo.eo_grand_total",
        "eo.eo_created_at",
        "ec.ec_name",
        "ec.ec_id",
        "ec_image",
        "esa.ecsa_address",
        "eo.eo_created_at"
        // 'av.area_name',
        // 'av.sub_city_name',
        // 'av.city_name',
        // 'av.province_name'
      )
      .join("e_customer AS ec", "eo.eo_ec_id", "ec.ec_id")
      .join("ec_shipping_address AS esa", "eo.eo_ecsa_id", "esa.ecsa_id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("eo.eo_created_at", [
            from_date as string,
            endDate,
          ]);
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
        if (eo_status) {
          this.andWhere("eo.eo_status", eo_status);
        }
      });

    const count = await this.db("e_order AS eo")
      .count("eo.eo_id AS total")
      .join("e_customer AS ec", "eo.eo_ec_id", "ec.ec_id")
      .join("ec_shipping_address AS esa", "eo.eo_ecsa_id", "esa.ecsa_id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("eo.eo_created_at", [
            from_date as string,
            endDate,
          ]);
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
        if (eo_status) {
          this.andWhere("eo.eo_status", eo_status);
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
        "eo.eo_id",
        "eo.eo_status",
        "eo.eo_payment_status",
        "eo.eo_total",
        "eo.eo_discount",
        "eo.eo_delivery_charge",
        "eo.eo_grand_total",
        "eo.eo_remarks",
        "eo.eo_created_at",
        "eo.eo_updated_at",
        "ec.ec_id",
        "ec.ec_name",
        "ec.ec_phone",
        "ec.ec_email",
        "esa.ecsa_label",
        "esa.ecsa_address",
        "esa.ecsa_landmark",
        // "av.area_name",
        // "av.sub_city_name",
        // "av.city_name",
        // "av.province_name",
        "eod.eod_ep_id",
        "eod.eod_ep_name",
        "epv.p_images",
        "eod.eod_price",
        "eod.eod_quantity",
        "eod.eod_av_id",
        "atv.av_value"
      )
      .leftJoin("e_customer AS ec", "eo.eo_ec_id", "ec.ec_id")
      .leftJoin("ec_shipping_address AS esa", "eo.eo_ecsa_id", "esa.ecsa_id")
      .leftJoin("address_view AS av", "esa.ecsa_ar_id", "av.area_id")
      .leftJoin("e_order_details AS eod", "eo.eo_id", "eod.eod_eo_id")

      .leftJoin("product_view AS epv", "eod.eod_ep_id", "epv.ep_id")
      .leftJoin("attribute_value AS atv", "eod.eod_av_id", "atv.av_id")
      .where("eo.eo_id", id);
    console.log({ data });

    const data2 = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;

      for (let j = 0; j < data2.length; j++) {
        if (data[i].eo_id === data2[j].eo_id) {
          found = true;

          data2[j].products.push({
            eod_ep_id: data[i].eod_ep_id,
            eod_ep_name: data[i].eod_ep_name,
            p_images: data[i].p_images,
            eod_price: data[i].eod_price,
            eod_quantity: data[i].eod_quantity,
            attributes: data[i].eod_av_id
              ? {
                  eod_av_id: data[i].eod_av_id,
                  av_value: data[i].av_value,
                }
              : {},
          });
        }
      }
      if (!found) {
        data2.push({
          eo_id: data[i].eo_id,
          eo_status: data[i].eo_status,
          eo_payment_status: data[i].eo_payment_status,
          eo_total: data[i].eo_total,
          eo_discount: data[i].eo_discount,
          eo_delivery_charge: data[i].eo_delivery_charge,
          eo_grand_total: data[i].eo_grand_total,
          eo_remarks: data[i].eo_remarks,
          eo_created_at: data[i].eo_created_at,
          eo_updated_at: data[i].eo_updated_at,
          ec_id: data[i].ec_id,
          ec_name: data[i].ec_name,
          ec_phone: data[i].ec_phone,
          ec_email: data[i].ec_email,
          ecsa_label: data[i].ecsa_label,
          ecsa_address: data[i].ecsa_address,
          ecsa_landmark: data[i].ecsa_landmark,
          area_name: data[i].area_name,
          sub_city_name: data[i].sub_city_name,
          city_name: data[i].city_name,
          province_name: data[i].province_name,
          products: [
            {
              eod_ep_id: data[i].eod_ep_id,
              eod_ep_name: data[i].eod_ep_name,
              p_images: data[i].p_images,
              eod_price: data[i].eod_price,
              eod_quantity: data[i].eod_quantity,
              attributes: data[i].eod_av_id
                ? {
                    eod_av_id: data[i].eod_av_id,
                    av_value: data[i].av_value,
                  }
                : {},
            },
          ],
        });
      }
    }

    const order_tracking_status = await this.db("e_order_tracking")
      .select("eot_status", "eot_details", "eot_date_time")
      .where({ eo_id: id });

    if (data.length) {
      return {
        success: true,
        data: { ...data2[0], order_tracking_status },
      };
    } else {
      return {
        success: false,
        message: "Order doesnot found with this id",
      };
    }
  }

  // update single ecommerce order
  public async updateSingleEorderPaymentService(
    req: customRequest<IorderUpdateBody>
  ) {
    return await this.db.transaction(async (trx) => {
      const { eo_payment_status } = req.body;
      const { id } = req.params;

      const checkOrder = await trx("e_order")
        .select("eo_id")
        .andWhereNot({ eo_status: "delivered" })
        .where({ eo_id: id });

      if (checkOrder.length) {
        return {
          success: false,
          message: "You cannot payment cause, this order has not delivered",
        };
      }

      const checkPayment = await trx("e_order")
        .select("eo_id")
        .andWhere({ eo_id: id })
        .andWhere({ eo_payment_status: 1 });

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
          eo_payment_status,
        })
        .where({ eo_id: id });

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
      const { eo_status, eot_details, eo_remarks } = req.body;
      const { orderId } = req.params;

      let response: { success: boolean; message: string } = {
        success: false,
        message: "",
      };

      if (eo_status === "rejected") {
        const res = await trx("e_order")
          .update({
            eo_status,
            eo_remarks,
          })
          .where({ eo_id: orderId });

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
        if (eo_status === "delivered") {
          const eOrderBody = {
            eo_id: orderId,
            eot_status: eo_status,
            eot_details: eo_remarks && eo_remarks,
          };

          const orderTrackingRes = await trx("e_order_tracking").insert(
            eOrderBody
          );

          // e-order status updating
          const orderRes = await trx("e_order")
            .update({ eo_status, eo_remarks })
            .where({ eo_id: orderId });

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
            eo_id: orderId,
            eot_status: eo_status,
            eot_details: eo_remarks && eo_remarks,
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
