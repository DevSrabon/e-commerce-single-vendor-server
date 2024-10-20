import { Request } from "express";
import { Stripe } from "stripe";
import config from "../../../utils/config/config";
import Lib from "../../../utils/lib/lib";
import { IEcommCustomer } from "../../ecommerce/ecommUtils/ecommTypes/ecommCustomerTypes";
import CommonAbstractServices from "../commonAbstract/common.abstract.service";

class CommonService extends CommonAbstractServices {
  constructor() {
    super();
  }
  // send otp to email
  public async sendOtpToEmailService(obj: {
    email: string;
    type: string;
    otpFor: string;
  }) {
    return await this.db.transaction(async (trx) => {
      const checkOtp = await this.db("email_otp")
        .select("email_otp_id", "hashed_otp", "otp_tried")
        .andWhere("otp_email", obj.email)
        .andWhere("otp_type", obj.type)
        .andWhere("otp_matched", 0)
        .andWhere("otp_tried", "<", 3)
        .andWhereRaw("ADDTIME(otp_create_time, '0:3:0') > NOW()");

      if (checkOtp.length > 0) {
        return {
          success: false,
          message: "Cannot send another OTP within 3 minutes",
        };
      }

      const otp = Lib.otpGenNumber(6);
      const hashed_otp = await Lib.hashPass(otp);

      const otpCreds = {
        hashed_otp: hashed_otp,
        otp_email: obj.email,
        otp_type: obj.type,
      };

      const sended = await Lib.sendEmail(
        obj.email,
        `Your One Time Password For ME MART ${obj.otpFor}`,
        Lib.generateHtmlOtpPage(otp, obj.otpFor)
      );

      console.log({ sended });

      await trx("email_otp").insert(otpCreds);

      if (sended) {
        return {
          success: true,
          message: "OTP sent successfully",
          data: {
            email: obj.email,
          },
        };
      } else {
        return { success: false, message: "Cannot send OTP" };
      }
    });
  }

  // match email otp
  public async matchEmailOtpService(obj: {
    email: string;
    otp: string;
    type: string;
  }) {
    const table = "email_otp";
    const checkOtp = await this.db(table)
      .select("email_otp_id", "hashed_otp", "otp_tried")
      .andWhere("otp_email", obj.email)
      .andWhere("otp_type", obj.type)
      .andWhere("otp_matched", 0)
      .andWhereRaw("ADDTIME(otp_create_time, '0:3:0') > NOW()");

    if (!checkOtp.length) {
      return {
        success: false,
        message: "OTP expired",
      };
    }
    const { email_otp_id, hashed_otp, otp_tried } = checkOtp[0];

    if (otp_tried > 3) {
      return {
        success: false,
        message: "You tried more then 3 time for this otp verification!",
      };
    }

    const otpValidation = await Lib.compare(obj.otp, hashed_otp);

    if (otpValidation) {
      await this.db(table)
        .update({
          otp_tried: otp_tried + 1,
          otp_matched: 1,
        })
        .where("email_otp_id", email_otp_id);

      let secret = config.JWT_SECRET_ADMIN;
      switch (obj.type) {
        case "forget_admin":
          secret = config.JWT_SECRET_ADMIN;
          break;
        case "forget_customer":
          secret = config.JWT_SECRET_CUSTOMER;
          break;
        default:
          break;
      }

      const token = Lib.createToken(
        {
          email: obj.email,
          type: obj.type,
        },
        secret,
        "5m"
      );

      return {
        success: true,
        message: "OTP matched successfully!",
        token,
      };
    } else {
      await this.db(table)
        .update({
          otp_tried: otp_tried + 1,
        })
        .where("email_otp_id", email_otp_id);

      return {
        success: false,
        message: "Invalid OTP",
      };
    }
  }

  // check user by unique key
  public async checkUserByUniqueKey(obj: {
    table: string;
    field: string;
    value: string;
  }) {
    const check = await this.db(obj.table)
      .select("*")
      .where(obj.field, obj.value);

    if (check.length) {
      return true;
    } else {
      return false;
    }
  }

  // create audit trail service
  public async createAuditTrailService({
    at_details,
    at_status = 1,
    at_admin_id,
  }: {
    at_details: string;
    at_status?: number;
    at_admin_id: number;
  }) {
    const res = await this.db("audit_trail").insert({
      at_details,
      at_status,
      at_admin_id,
    });

    if (res.length) {
      return true;
    } else {
      return false;
    }
  }

  // check customer common service
  public async commonCheckCustomer(email: string): Promise<IEcommCustomer[]> {
    const checkCustomer = await this.db("e_customer")
      .select(
        "ec_id",
        "ec_name",
        "ec_phone",
        "ec_image",
        "ec_email",
        "ec_password",
        "ec_status",
        "ec_is_deleted"
      )
      .where("ec_email", email);

    return checkCustomer;
  }

  public async getAllCurrencies(req: Request) {
    const currencies = await this.db("currency").select("*").first();
    return {
      success: true,
      data: currencies,
      message: "Currencies retrieved successfully",
    };
  }

  // make stripe payment
  public async makeStripePayment(payload: {
    items: {
      name: string;
      amount: number;
      currency: string;
      quantity: number;
      description?: string;
      image?: string;
    }[];
    discount?: number;
    currency: string;
    deliveryCharge?: number;
    taxAmount?: number;
    customer: {
      name: string;
      email: string;
      address: string;
    };
  }) {
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);

    let coupon;

    // If discount is provided, create a coupon dynamically
    if (payload.discount) {
      if (payload.discount > 0 && payload.discount <= 100) {
        coupon = await stripe.coupons.create({
          percent_off: payload.discount,
          duration: "once",
        });
      } else if (payload.discount > 100) {
        coupon = await stripe.coupons.create({
          amount_off: payload.discount * 100,
          currency: payload.currency,
          duration: "once",
        });
      }
    }

    // Create line items dynamically from the payload
    const lineItems: {
      price_data: {
        currency: string;
        product_data: {
          name: string;
          images?: string[];
          description?: string;
        };
        unit_amount: number;
      };
      quantity?: number;
    }[] = payload.items.map((item) => ({
      price_data: {
        currency: item.currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          description: item.description || "",
        },
        unit_amount: item.amount * 100, // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Optionally add delivery charge
    if (payload.deliveryCharge && payload.deliveryCharge > 0) {
      lineItems.push({
        price_data: {
          currency: payload.currency,
          product_data: {
            name: "Delivery Charge",
          },
          unit_amount: payload.deliveryCharge * 100, // Convert to cents
        },
        quantity: 1,
      });
    }

    // Optionally add tax amount
    if (payload.taxAmount && payload.taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: payload.currency,
          product_data: {
            name: "Taxes",
          },
          unit_amount: payload.taxAmount * 100, // Convert to cents
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      discounts: coupon ? [{ coupon: coupon.id }] : [],
      success_url: `http://localhost:3000/success?order_id=1`,
      cancel_url: `http://localhost:3000/cancel?order_id=1`,
      metadata: {
        order_id: "1", // Use a string for metadata
        customer_name: payload.customer.name,
      },
      payment_intent_data: {
        metadata: {
          order_id: "1", // Also include it in the payment intent metadata
        },
      },
    });

    // Update the order with the Stripe session ID

    return {
      redirect_url: session.url,
    };
  }
}

export default CommonService;
