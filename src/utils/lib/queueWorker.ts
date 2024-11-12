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
