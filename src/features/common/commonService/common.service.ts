import { Request } from "express";
import { Knex } from "knex";
import { Stripe } from "stripe";
import { io } from "../../../app/socket";
import config from "../../../utils/config/config";
import Lib from "../../../utils/lib/lib";
import { IOrder } from "../../../utils/types/commonTypes";
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
        `Your One Time Password For SABA AL WADU ${obj.otpFor}`,
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
    console.log({ check });
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
        "currency",
        "c_name_en",
        "c_name_ar",
        "country_id",
        "ec_status",
        "ec_is_deleted"
      )
      .leftJoin("country", "c_id", "country_id")
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

  // Delivery Charge
  public async getDeliveryCharge(req: Request) {
    const data = await this.db("delivery_charge").select("*").first();
    return {
      success: true,
      message: "Data fetched successfully!",
      data,
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
      image?: string[];
    }[];
    orderId: string;
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
    console.log({ payload: JSON.stringify(payload) });
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);

    let coupon;

    if (payload.discount) {
      if (payload.discount > 0 && payload.discount <= 100) {
        coupon = await stripe.coupons.create({
          percent_off:
            payload.currency.toLowerCase() === "aed"
              ? payload.discount
              : payload.discount,
          duration: "once",
        });
      } else if (payload.discount > 100) {
        coupon = await stripe.coupons.create({
          amount_off:
            payload.currency.toLowerCase() === "aed"
              ? payload.discount
              : payload.discount * 100,
          currency: payload.currency,
          duration: "once",
        });
      }
    }

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
          images:
            // item.image && Array.isArray(item.image) ? item.image : undefined, // Ensure images array is passed
            [
              "https://m360ict-ecommerce.s3.ap-south-1.amazonaws.com/memart/product_files/1730567278676-675357971.png",
            ],
          description: item.description || undefined,
        },
        unit_amount: item.amount * 100,
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
          unit_amount:
            payload.currency.toLowerCase() === "aed"
              ? payload.deliveryCharge
              : payload.deliveryCharge * 100,
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
          unit_amount:
            payload.currency.toLowerCase() === "aed"
              ? payload.taxAmount
              : payload.taxAmount * 100,
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

      customer_email: payload.customer.email,
      payment_intent_data: {
        metadata: {
          order_id: payload.orderId,
        },
      },
    });
    return {
      redirect_url: session.url,
    };
  }

  public orderEmailPayload(payload: IOrder) {
    return {
      amount: Number(payload.total),
      currency: payload.currency,
      customer: {
        name: payload.address_name,
        email: payload.customer_email,
        phone: payload.address_phone,
        address: `${payload.address_apt}, ${payload.address_street_address}, ${payload.address_city}, ${payload.address_country_name_en}`,
      },
      discountTotal: Number(payload.discount),
      grandTotal: Number(payload.grand_total),
      orderId: payload.order_no,
      status: payload.status,
      orderDate: payload.created_at,
      items: payload.order_details.map((item) => {
        return {
          amount: Number(item.price),
          name: item.product_name_en,
          quantity: item.quantity,
          image: item.color_images[0],
        };
      }),
    };
  }

  // Update SocketId
  public async updateSocketId({
    id,
    type,
    socketId,
  }: {
    id: number;
    type: "customer" | "admin";
    socketId: string;
  }) {
    try {
      switch (type) {
        case "customer":
          await this.db("e_customer")
            .update({ socket_id: socketId })
            .where({ ec_id: id });
          break;
        case "admin":
          await this.db("admin_user")
            .update({ socket_id: socketId })
            .where({ au_id: id });
          break;
        default:
          throw new Error("Invalid user type");
      }
    } catch (error) {
      console.error("Error updating socket ID:", error);
      throw new Error("Failed to update socket ID");
    }
  }

  // socket
  private async emitNotification(data: {
    customer_id: number;
    related_id: number;
    message: string;
    file?: string;
    read_status?: number;
    created_at?: string;
    type: string;
  }) {
    data.read_status = 0;
    data.created_at = new Date().toISOString();
    io.emit("new_notification", data);
  }

  // Create Notification
  public async createNotification(
    trx: Knex.Transaction,
    type: "admin" | "customer",
    payload: {
      customer_id: number;
      related_id: number;
      message: string;
      type: string;
    }
  ) {
    const table =
      type === "admin" ? "admin_notification" : "customer_notification";
    await trx(table).insert(payload);
    await this.emitNotification(payload);
  }
}

export default CommonService;
