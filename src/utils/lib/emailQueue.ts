import { Queue } from "bullmq";
import { REDIS_URL } from "../miscellaneous/constants";

// Create an email queue
const emailQueue = new Queue("emailQueue", {
  connection: REDIS_URL,
});

// Function to add email jobs to the queue
export const sendEmail = async (emailData: {
  to: string;
  subject: string;
  body: any;
}) => {
  try {
    const res = await emailQueue.add("sendEmailJob", emailData, {
      attempts: 3, // Retry on failure
      backoff: 5000, // Wait 5 seconds before retrying
      removeOnComplete: true,
      delay: 5000,
    });
    console.log("Email added to queue", res.id);
    return true;
  } catch (error) {
    console.log("error in sending email", error);
    return false;
  }
};

export default emailQueue;
