import { Queue } from "bullmq";
import { Request } from "express";
import config from "../../../utils/config/config";
import CustomError from "../../../utils/lib/customError";
import { ROOT_FOLDER } from "../../../utils/miscellaneous/constants";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";
import EcommProductService from "./ecomm.product.service";

export interface IOrderProduct {
  all_images: any;
  p_color_id: null;
  color_id: number;
  size_id: number;
  price: number;
  id: number;
  v_id?: number;
  quantity: number;
}

interface IOrderProductDetails {
  ep_id: number;
  id?: number;
  ep_name_en: string;
  price: number;
  quantity: number;
  v_id: number;
  p_image: string;
  size_id: number;
  p_color_id: number;
}

class EcommOrderService extends EcommAbstractServices {
  private ecommProductService = new EcommProductService();
  private cancelQueue = new Queue("cancelOrderQueue");
  constructor() {
    super();
  }

  // customer place order service
  public async ecommPlaceOrderService(req: Request) {
    const { ec_id } = req.customer;
    const { address_id, products, coupon, currency } = req.body;
    const pId: number[] = products.map((item: IOrderProduct) => item.id);
    const checkAddress = await this.db("ec_shipping_address as ecsa")
      .select("ecsa.*", "c.c_name_en", "c.c_short_name")
      .where("ec_id", ec_id)
      .join("country as c", "ecsa.country_id", "c.c_id")
      .andWhere("id", address_id);

    if (!checkAddress.length) {
      return {
        success: false,
        message: "Address not found",
      };
    }

    const orderProduct = await this.ecommProductService.getProductForOrder(pId);

    if (pId.length !== orderProduct.length) {
      return {
        success: false,
        message: "Some of product are not available of this order",
      };
    }

    let total = 0;
    let stockOut: string | null = null;
    const productDetails: IOrderProductDetails[] = products.map(
      (item: IOrderProduct, i: number) => {
        const currProduct = orderProduct.find(
          (item2) => item2.p_id === parseInt(item.id.toString())
        );

        if (currProduct?.available_stock < item.quantity) {
          stockOut = `${currProduct.p_name_en} is out of stock!`;
        }
        total += parseInt(item.price.toString()) * item.quantity;
        return {
          ep_id: currProduct.p_id,
          ep_name_en: currProduct.p_name_en,
          ep_name_ar: currProduct.p_name_ar,
          price: item.price,
          quantity: item.quantity,
          p_image: `${config.AWS_S3_BASE_URL}${ROOT_FOLDER}/${orderProduct[i].p_images[0].image}`,
          v_id: item.v_id || null,
          p_color_id: item.p_color_id || null,
          size_id: item.size_id || null,
        };
      }
    );
    if (stockOut) {
      return {
        success: false,
        message: stockOut,
      };
    }
    let grand_total = total;
    let deliveryCharge = 0;
    if (
      checkAddress[0].c_short_name !== "AE" ||
      checkAddress[0].c_short_name !== "OM"
    ) {
    }

    let discount = 0;

    // if (delivery_charge) {
    //   grand_total += parseInt(delivery_charge);
    // }
    if (coupon) {
      const getCoupon = await this.db("coupons")
        .select("discount", "discount_type")
        .where("id", coupon)
        .first();
      if (!getCoupon) {
        return {
          success: false,
          message: "Invalid coupon code",
        };
      }

      switch (getCoupon.discount_type) {
        case "percentage":
          discount = (grand_total * Number(getCoupon.discount)) / 100;
          break;
        case "fixed":
          discount = Number(getCoupon.discount);
          break;
        default:
          discount = 0;
      }
      grand_total -= discount;
    }

    let order_no = "1000";
    const getLastOrder = await this.db("e_order")
      .select("order_no")
      .whereNotNull("order_no")
      .orderBy("order_no", "desc")
      .first();
    if (getLastOrder) {
      order_no = (+getLastOrder.order_no + 1).toString();
    }

    return await this.db.transaction(async (trx) => {
      const order = await trx("e_order").insert({
        ec_id: ec_id,
        ecsa_id: address_id,
        total: total,
        discount,
        currency,
        order_no,
        coupon,
        delivery_charge,
        grand_total,
      });
      const currProductDetails = productDetails.map((item) => {
        const { p_image, ...rest } = item;
        return { ...rest, eo_id: order[0] };
      });

      await trx("e_order_details").insert(currProductDetails);
      const address = `${checkAddress[0].apt}, ${checkAddress[0].street_address}, ${checkAddress[0].city}, ${checkAddress[0].state}, ${checkAddress[0].c_name_ar}, ${checkAddress[0].zip_code}`;
      const { redirect_url } = await this.commonService.makeStripePayment({
        items: productDetails.map((item) => {
          return {
            name: item.ep_name_en,
            amount: item.price,
            currency: currency,
            image: item.p_image,
            quantity: item.quantity,
          };
        }),
        currency,
        discount,
        deliveryCharge,
        taxAmount: 0,
        orderId: order[0]?.toString(),
        customer: {
          name: req.customer.ec_name,
          email: req.customer.ec_email,
          address,
        },
      });

      this.cancelQueue.add(
        "sendCancelJob",
        { orderId: order[0] },
        { attempts: 0, backoff: 5000, removeOnComplete: true, delay: 3600000 }
      );
      // await sendEmail(
      //   {
      //     to: "et.srabon@gmail.com",
      //     subject: "Order placed",
      //     body: createOrderConfirmationEmail({
      //       amount: total,
      //       discountTotal: discount,
      //       grandTotal: grand_total,
      //       currency,
      //       customer: {
      //         name: req.customer.ec_name,
      //         email: req.customer.ec_email,
      //         address,
      //       },
      //       items: productDetails.map((item) => {
      //         return {
      //           amount: item.price,
      //           name: item.ep_name_en,
      //           quantity: item.quantity,
      //           image: item.p_image,
      //         };
      //       }),
      //       orderDate: new Date().toLocaleString(),
      //       orderId: order_no,
      //     }),
      //   }
      //   // "et.srabon@gmail.com",
      //   // "Order placed",
      //   // {
      //   //   amount: total,
      //   //   discountTotal: discount,
      //   //   grandTotal: grand_total,
      //   //   currency,
      //   //   customer: {
      //   //     name: req.customer.ec_name,
      //   //     email: req.customer.ec_email,
      //   //     address: checkAddress[0].c_name_en,
      //   //   },
      //   //   items: productDetails.map((item) => {
      //   //     return {
      //   //       amount: item.price,
      //   //       name: item.ep_name_en,
      //   //       quantity: item.quantity,
      //   //       image: item.p_image,
      //   //     };
      //   //   }),
      //   //   orderDate: new Date().toLocaleString(),
      //   //   orderId: order_no,
      //   // }
      // );
      if (!redirect_url) {
        throw new CustomError("Payment Failure", 412, "Unprocessable Entity");
      }

      return {
        success: true,
        message: "Order placed!",
        data: {
          redirect_url,
        },
      };
    });
  }

  public async directOrder(req: Request) {
    const { ec_id } = req.customer;
    const { order_id } = req.body;
  }

  // get order of customer service
  public async ecommGetOrderService(req: Request) {
    const { ec_id } = req.customer;
    const data = await this.db("e_order")
      .select(
        "id as id",
        "status as order_status",
        "payment_status as payment_status",
        "grand_total as grand_total",
        "created_at as order_date"
      )
      .where("ec_id", ec_id);

    return {
      success: true,
      data,
    };
  }

  // get single order service
  public async getSingleOrderService(req: Request) {
    const { ec_id } = req.customer;
    const { id } = req.params;

    const order = await this.db("e_order")
      .select(
        "id as id",
        "ecsa_id",
        "status as order_status",
        "payment_status as payment_status",
        "total as sub_total",
        "delivery_charge as delivery_charge",
        "discount as discount",
        "grand_total as grand_total",
        "created_at as order_create_date"
      )
      .andWhere("ec_id", ec_id)
      .andWhere("id", id);

    if (!order.length) {
      return {
        success: false,
        message: "No order found!",
      };
    }
    const { ecsa_id, ...rest } = order[0];

    const address = await this.db("ec_shipping_address as esa")
      .select("esa.*", "c.c_name_en", "c.c_name_ar")
      .join("country as c", "esa.country_id", "c.c_id")
      .where("esa.id", ecsa_id);

    const products = await this.db("e_order_details as eod")
      .select(
        "eod.id as id",
        "eod.ep_name_en as ep_name_en",
        "eod.ep_name_ar as ep_name_ar",
        "eod.price as price",
        "eod.quantity as quantity",
        "eod.color_id as color_id",
        "cl.color_en",
        "cl.color_ar",
        "sz.size"
      )
      .leftJoin("color as cl", "eod.color_id", "cl.id")
      .leftJoin("size as sz", "eod.size_id", "sz.id")
      .leftJoin("variant_product as av", "eod.v_id", "av.id")
      .leftJoin("fabric as fa", "av.fabric_id", "fa.id")
      .where("eod.eo_id", order[0].id);

    return {
      success: true,
      data: {
        ...rest,
        address: address[0],
        products,
      },
    };
  }
}
export default EcommOrderService;
