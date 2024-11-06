import { Worker } from "bullmq";

import { db } from "../../app/database";
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
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
    concurrency: 1,
  }
);

// export const cancelQueue = new Queue("cancelOrderQueue");

// Function to cancel pending orders
const cancelPendingOrders = async (orderId: number) => {
  console.log(`Canceling pending order for orderId: ${orderId}`);

  const canceledOrders = await db("e_order")
    .where("id", orderId)
    .andWhere("status", "pending")
    .andWhere("ADDTIME(created_at, '1:0:0') < NOW()")
    .update({ status: "cancelled" });

  console.log(`Canceled ${canceledOrders} pending orders.`);
};

// Worker to handle cancellation jobs
const cancelWorker = new Worker(
  "cancelOrderQueue",
  async (job) => {
    await cancelPendingOrders(job.data.orderId);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);
