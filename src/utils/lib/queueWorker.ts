import { Worker } from "bullmq";

import { db } from "../../app/database";
import { REDIS_URL } from "../miscellaneous/constants";
import Lib from "./lib"; // adjust the path to your lib setup

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("Processing job:", job.id);
    const { to, subject, body } = job.data;
    try {
      console.log(`Sending email to ${to}`);
      await Lib.sendEmail(to, subject, body);
      console.log(`Email sent to ${to}`);
      await db("email").insert({
        recipient: to,
        subject,
        body,
        status: "success",
      });
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      await db("email").insert({
        recipient: to,
        subject,
        body,
        status: "failed",
      });
    }
  },
  {
    connection: REDIS_URL,
    concurrency: 1,
  }
);

// Function to cancel pending orders
const cancelPendingOrders = async (orderId: number) => {
  console.log(`Canceling pending order for orderId: ${orderId}`);

  try {
    await db.transaction(async (trx) => {
      // Fetch order and order details
      const orderDetails = await trx("order_view as eo")
        .select(
          "eo.order_details",
          "eo.customer_id",
          "eo.order_no",
          "eo.customer_name",
          "eo.customer_email"
        )
        .where("eo.id", orderId)
        .andWhere("eo.status", "pending")
        .andWhereRaw("ADDTIME(eo.created_at, '0:0:1') < NOW()")
        .first()
        .forUpdate();
      if (orderDetails.length === 0) {
        console.log(`No pending order found for orderId: ${orderId}`);
        return;
      }

      // Update the order status
      const canceledOrders = await trx("e_order")
        .where("id", orderId)
        .update({ status: "cancelled" });
      await trx("customer_notification").insert({
        type: "order_update",
        message: `Your order #${orderDetails.order_no} has been cancelled due to unpaid`,
        related_id: orderId,
      });
      await trx("admin_notification").insert({
        type: "order_update",
        message: `An order #${orderDetails.order_no} for Customer Name ${orderDetails.customer_name}, Customer email customer_email has been cancelled due to unpaid`,
        related_id: orderId,
      });
      if (canceledOrders) {
        console.log(`Order ${orderId} marked as cancelled.`);

        // Update inventory for each product in the order
        for (const detail of orderDetails.order_details) {
          await trx("inventory")
            .where("i_p_id", detail.product_id)
            .increment("i_quantity_available", detail.quantity)
            .decrement("i_quantity_sold", detail.quantity);
        }

        console.log(`Inventory updated for cancelled orderId: ${orderId}`);
      }
    });
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error; // Re-throw error for visibility
  }
};

// Worker to handle cancellation jobs
const cancelWorker = new Worker(
  "cancelOrderQueue",
  async (job) => {
    await cancelPendingOrders(job.data.orderId);
  },
  {
    connection: REDIS_URL,
    concurrency: 1,
  }
);
