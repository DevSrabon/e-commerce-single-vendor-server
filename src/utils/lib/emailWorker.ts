// import { Worker } from "bullmq";

// import { db } from "../../app/database";
// import Lib from "./lib"; // adjust the path to your lib setup

// console.log("Starting Email Worker...");

// const emailWorker = new Worker(
//   "emailQueue",
//   async (job) => {
//     console.log("Processing job:", job.id);
//     const { to, subject, body } = job.data;
//     try {
//       console.log(`Sending email to ${to}`);
//       await Lib.sendEmail(to, subject, body);
//       console.log(`Email sent to ${to}`);
//       await db("email").insert({
//         recipient: to,
//         subject,
//         body,
//         status: "success",
//       });
//     } catch (error) {
//       console.error(`Failed to send email to ${to}:`, error);
//       await db("email").insert({
//         recipient: to,
//         subject,
//         body,
//         status: "failed",
//       });
//     }
//   },
//   {
//     connection: {
//       host: "127.0.0.1",
//       port: 6379,
//     },
//     concurrency: 1,
//   }
// );

// emailWorker.on("completed", (job) => {
//   console.log(`Job ${job.id} completed successfully.`);
// });

// emailWorker.on("failed", (job, err) => {
//   console.error(`Job ${job?.id} failed with error: ${err.message}`);
// });

// emailWorker.on("error", (err) => {
//   console.error("Worker encountered an error:", err);
// });
