import { Request, Response } from "express";
import CommonAbstractServices from "../common/commonAbstract/common.abstract.service";

class Webhooks extends CommonAbstractServices {
  constructor() {
    super();
  }
  public async stripeWebhook(req: Request, res: Response) {
    const event = req.body;

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent);

        // Retrieve order ID from metadata
        const orderId = paymentIntent.metadata.order_id;
        console.log(`Order ID from payment intent: ${orderId}`);

        break;

      case "payment_intent.payment_failed":
        const checkoutSession = event.data.object;
        const checkoutOrderId = checkoutSession.metadata.order_id; // Get order ID from metadata
        console.log(`Checkout Session Completed. Order ID: ${checkoutOrderId}`);

        break;

      // Other cases...

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Respond to Stripe that the webhook was received successfully
    res.status(200).send();
  }
}

export default Webhooks;
