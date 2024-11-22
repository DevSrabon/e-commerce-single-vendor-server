import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../app/database";
import CommonAbstractServices from "../features/common/commonAbstract/common.abstract.service";
import CommonService from "../features/common/commonService/common.service";
import config from "../utils/config/config";
import Lib from "../utils/lib/lib";
import { createPaymentConfirmationEmail } from "../utils/template/orderConfirmationTemplate";
import { IOrder } from "../utils/types/commonTypes";

class Webhooks extends CommonAbstractServices {
  private commonService = new CommonService();
  constructor() {
    super();
    this.stripeWebhook = this.stripeWebhook.bind(this);
  }
  public async stripeWebhook(req: Request, res: Response) {
    const event = req.body;
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          console.table({ paymentIntent: JSON.stringify(paymentIntent) })
        );

        const orderId = paymentIntent.metadata.order_id;
        const order: IOrder = await db("order_view")
          .select("*")
          .where({ id: orderId })
          .first();
        const paymentIntentCurrency = paymentIntent.currency.toLowerCase();

        if (!order) {
          try {
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntent.id,
            });

            console.log("Refund successful:", refund.id);
          } catch (error) {
            console.error("Failed to issue refund:", error);
          }
          return;
        } else {
          const getCurrency = await db("currency").where("status", 1).first();
          let amountInAED = 0;
          const paymentIntentAmount = Number(
            paymentIntentCurrency === "gbp"
              ? paymentIntent.amount / 100
              : paymentIntent.amount
          );
          if (getCurrency) {
            const aedRate = Number(getCurrency.aed);
            const usdRate = aedRate / Number(getCurrency.usd);
            const gbpRate = aedRate / Number(getCurrency.gbp);

            if (paymentIntentCurrency === "aed") {
              amountInAED = paymentIntentAmount;
            } else if (paymentIntentCurrency === "usd" && usdRate) {
              // Convert USD to AED
              amountInAED = paymentIntentAmount * usdRate;
            } else if (paymentIntentCurrency === "gbp" && gbpRate) {
              // Convert GBP to AED
              amountInAED = paymentIntentAmount * gbpRate;
            }
          }

          // Stripe Charges

          const paymentMethod = await stripe.paymentMethods.retrieve(
            paymentIntent.payment_method
          );
          const cardType = paymentMethod.card?.brand;

          await db("e_order")
            .update({
              trx_id: paymentIntent.id,
              payment_status: 1,
              payment_type: cardType,
              status: "processing",
            })
            .where("id", orderId);

          await db("account_ledger").insert({
            account_id: 1,
            voucher_no: order.order_no,
            amount: amountInAED,
            type: "IN",
            details: `Order ${order.order_no} payment received`,
            tr_type: "E-commerce Payment",
            payment_method: "Stripe",
            ledger_date: new Date(),
          });

          await Lib.sendEmail(
            order.customer_email,
            "Payment Confirmation",
            createPaymentConfirmationEmail(
              this.commonService.orderEmailPayload(order)
            )
          );

          // await sendEmail({
          //   to: order.ec_email,
          //   subject: "Payment Confirmation",
          //   body: createPaymentConfirmationEmail({
          //     amountPaid: paymentIntentAmount,
          //     currency: paymentIntentCurrency,
          //     customer: {
          //       name: order.name,
          //       email: order.ec_email,
          //       address: `${order.apt}, ${order.street_address}, ${order.city}, ${order.state}, ${order.c_name_en}, ${order.zip_code}`,
          //     },
          //     paymentDate: new Date().toDateString(),
          //   }),
          // });
        }

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
