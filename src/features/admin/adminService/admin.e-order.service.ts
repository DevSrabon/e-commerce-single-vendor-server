import { Request } from "express";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import { createOrderStatusEmail } from "../../../utils/template/orderConfirmationTemplate";
import { IOrder } from "../../../utils/types/commonTypes";
import CommonService from "../../common/commonService/common.service";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
import { IOrderUpdateBody, customRequest } from "../utils/types/combinedTypes";

class AdminEcommerceOrderService extends AdminAbstractServices {
  private commonService = new CommonService();
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
        // "eo.currency",
        // "eo.grand_total",
        this.db.raw(`CONCAT(eo.grand_total, ' ', eo.currency) as grand_total`),
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

    const data = await this.db("order_view")
      .select("*")
      .where("id", id)
      .first();

    if (data) {
      return {
        success: true,
        data,
        message: "successfully fetched!",
      };
    } else {
      return {
        success: false,
        message: "Order doesn't found with this id",
      };
    }
  }
  public async updateSingleEorderPaymentService(
    req: customRequest<IOrderUpdateBody>
  ) {
    return await this.db.transaction(async (trx) => {
      const { payment_status } = req.body;
      const { id } = req.params;

      const checkOrder: IOrder = await trx("order_view")
        .select("*")
        .where({ id })
        .first();

      if (!checkOrder) {
        throw new CustomError(
          "You cannot payment cause, this order has not delivered",
          412,
          "Unprocessable Entity"
        );
      }

      if (checkOrder.payment_status === 1) {
        return {
          success: false,
          message: "Already payment has been done",
        };
      }
      const customer_id = checkOrder.customer_id;
      const customer_email = checkOrder.customer_email;
      let response: { success: boolean; message: string } = {
        success: false,
        message: "",
      };

      const paymentStatus = payment_status === 1 ? "completed" : "failed";
      const notifyAndEmail = async (message: string) => {
        // Notify Customer
        await this.commonService.createNotification(
          "customer",
          {
            customer_id,
            related_id: Number(id),
            message: `Your order has been ${message}`,
            type: "order_update",
          },
          trx
        );
        // // Send Email to Customer
        await Lib.sendEmail(
          customer_email,
          `Your Order #${checkOrder.order_no} has been ${paymentStatus}!`,
          createOrderStatusEmail(
            this.commonService.orderEmailPayload({
              ...checkOrder,
              status: paymentStatus,
            })
          )
        );
      };

      await notifyAndEmail(
        `Payment has been ${paymentStatus} for Order ${checkOrder.order_no}`
      );

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
    req: customRequest<IOrderUpdateBody>
  ) {
    return await this.db.transaction(async (trx) => {
      const { status, remarks } = req.body;
      console.log({ status, remarks });
      const { orderId } = req.params;
      const orderDetails: IOrder = await this.db("order_view")
        .select("*")
        .where({ id: orderId })
        .first();

      if (!orderDetails) {
        throw new CustomError("Invalid Order", 412, "Unprocessable Entity");
      }

      if (orderDetails.status === "delivered") {
        throw new CustomError(
          "This product has been delivered. You can't update it now!",
          412,
          "Unprocessable Entity"
        );
      }

      let response: { success: boolean; message: string } = {
        success: false,
        message: "",
      };

      const eOrderBody = {
        eo_id: orderId,
        status: status,
        details: remarks || null,
      };

      const notifyAndEmail = async (message: string) => {
        // Notify Customer
        await this.commonService.createNotification(
          "customer",
          {
            customer_id: orderDetails.customer_id,
            related_id: Number(orderId),
            message: `Your order #${orderDetails.order_no} has been ${message}`,
            type: "order_update",
          },
          trx
        );
        // // Send Email to Customer
        await Lib.sendEmail(
          orderDetails.customer_email,
          `Your Order #${orderDetails.order_no} has been ${message}!`,
          createOrderStatusEmail(
            this.commonService.orderEmailPayload({ ...orderDetails, status })
          )
        );
      };
      if (
        status === "rejected" ||
        status === "cancelled" ||
        status === "delivered" ||
        status == "shipped"
      ) {
        const res = await trx("e_order")
          .update({
            status,
            remarks,
          })
          .where({ id: orderId });

        if (status === "delivered") {
          await trx("e_order_tracking").insert(eOrderBody);
        }
        if (res) {
          await notifyAndEmail(status);
          response = {
            success: true,
            message: `This Order #${orderDetails.order_no} has been ${status}`,
          };
        } else {
          response = {
            success: false,
            message: `Order cannot be ${status} right now`,
          };
        }
      } else {
        const orderTrackingRes = await trx("e_order_tracking").insert(
          eOrderBody
        );

        if (orderTrackingRes) {
          await notifyAndEmail(status);
          response = {
            success: true,
            message: `Order ${status}`,
          };
        } else {
          response = {
            success: false,
            message: `Order cannot be ${status} right now`,
          };
        }
      }

      return {
        ...response,
      };
    });
  }
}

export default AdminEcommerceOrderService;
