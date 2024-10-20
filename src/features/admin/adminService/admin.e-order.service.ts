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
        "esa.ecsa_address",
        "eo.created_at"
        // 'av.area_name',
        // 'av.sub_city_name',
        // 'av.city_name',
        // 'av.province_name'
      )
      .join("e_customer AS ec", "eo.ec_id", "ec.ec_id")
      .join("ec_shipping_address AS esa", "eo.ecsa_id", "esa.ecsa_id")
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
      .join("ec_shipping_address AS esa", "eo.ecsa_id", "esa.ecsa_id")
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
        "esa.ecsa_label",
        "esa.ecsa_address",
        "esa.ecsa_landmark",
        // "av.area_name",
        // "av.sub_city_name",
        // "av.city_name",
        // "av.province_name",
        "eod.ep_id",
        "eod.ep_name",
        "epv.p_images",
        "eod.price",
        "eod.quantity",
        "eod.v_id",
        "atv.av_value"
      )
      .leftJoin("e_customer AS ec", "eo.ec_id", "ec.ec_id")
      .leftJoin("ec_shipping_address AS esa", "eo.ecsa_id", "esa.ecsa_id")
      .leftJoin("address_view AS av", "esa.ecsa_ar_id", "av.area_id")
      .leftJoin("e_order_details AS eod", "eo.id", "eod.id")

      .leftJoin("product_view AS epv", "eod.ep_id", "epv.ep_id")
      .leftJoin("attribute_value AS atv", "eod.v_id", "atv.v_id")
      .where("eo.id", id);
    console.log({ data });

    const data2 = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;

      for (let j = 0; j < data2.length; j++) {
        if (data[i].id === data2[j].id) {
          found = true;

          data2[j].products.push({
            ep_id: data[i].ep_id,
            ep_name: data[i].ep_name,
            p_images: data[i].p_images,
            price: data[i].price,
            quantity: data[i].quantity,
            attributes: data[i].v_id
              ? {
                  v_id: data[i].v_id,
                  av_value: data[i].av_value,
                }
              : {},
          });
        }
      }
      if (!found) {
        data2.push({
          id: data[i].id,
          status: data[i].status,
          payment_status: data[i].payment_status,
          total: data[i].total,
          discount: data[i].discount,
          delivery_charge: data[i].delivery_charge,
          grand_total: data[i].grand_total,
          remarks: data[i].remarks,
          created_at: data[i].created_at,
          updated_at: data[i].updated_at,
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
              ep_id: data[i].ep_id,
              ep_name: data[i].ep_name,
              p_images: data[i].p_images,
              price: data[i].price,
              quantity: data[i].quantity,
              attributes: data[i].v_id
                ? {
                    v_id: data[i].v_id,
                    av_value: data[i].av_value,
                  }
                : {},
            },
          ],
        });
      }
    }

    const order_tracking_status = await this.db("e_order_tracking")
      .select("status", "details", "date_time")
      .where({ id: id });

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
