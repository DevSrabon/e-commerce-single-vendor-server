import { Queue } from "bullmq";
import { Request } from "express";
import config from "../../../utils/config/config";
import CustomError from "../../../utils/lib/customError";
import { ROOT_FOLDER } from "../../../utils/miscellaneous/constants";
import { callProductStoredProcedure } from "../../../utils/procedure/common-procedure";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";
import EcommProductService from "./ecomm.product.service";

export interface IOrderProduct {
  all_images: any;
  p_color_id: null;
  color_id: number;
  size_id: number;
  price: number;
  id: number;
  cart_id?: number;
  v_id?: number;
  quantity: number;
}

interface IOrderPayload {
  cart_ids?: number[];
  address_id: number;
  coupon?: number;
  products: IOrderProductDetails[];
}

interface IOrderProductDetails {
  cart_id?: number;
  ep_id: number;
  id?: number;
  ep_name_en: string;
  price: number;
  quantity: number;
  v_id: number;
  p_image: string[];
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
    const { ec_id, ec_name, ec_email } = req.customer;
    const { address_id, products, coupon, cart_ids } =
      req.body as IOrderPayload;

    return await this.db.transaction(async (trx) => {
      // Fetch and validate currency
      const getCurrency = await trx("e_customer")
        .select("currency")
        .where({ ec_id })
        .first();
      const currency = getCurrency?.currency;
      if (!currency) {
        throw new CustomError(
          "Please select a currency",
          412,
          "Unprocessable Entity"
        );
      }

      // Validate address
      const checkAddress = await trx("ec_shipping_address as ecsa")
        .select("ecsa.*", "c.c_name_en", "c.c_short_name")
        .join("country as c", "ecsa.country_id", "c.c_id")
        .where({ ec_id })
        .andWhere("id", address_id)
        .first();

      if (!checkAddress) {
        throw new CustomError("Address not found", 404, "Not Found");
      }

      // Initialize variables for order processing
      let total = 0;
      let stockOut: string | null = null;
      const productDetails: IOrderProductDetails[] = [];
      const inventoryUpdates: { i_p_id: number; quantity: number }[] = [];

      async function getCartItems(cart_ids: number[]) {
        return trx("cart_items as ci")
          .select(
            "ci.p_id as id",
            "pc.id as p_color_id",
            "ps.size_id",
            "ps.p_id as pId",
            "vp.id as v_id",
            "ci.quantity"
          )
          .join("p_color as pc", "pc.id", "ci.p_color_id")
          .join("p_size as ps", function () {
            this.on("ps.size_id", "ci.size_id").andOn("ps.p_id", "ci.p_id");
          })
          .join("variant_product as vp", "vp.id", "ci.v_id")
          .whereIn("ci.id", cart_ids);
      }
      // Process products from cart_ids or directly
      const productsToProcess = cart_ids
        ? await getCartItems(cart_ids)
        : products;

      for (const product of productsToProcess) {
        const orderProduct = await callProductStoredProcedure(
          "GetProductForOrder",
          product.id as number,
          product.v_id,
          product.p_color_id,
          product.size_id
        );
        if (!orderProduct) {
          throw new CustomError(
            "Some products are not available for this order",
            412,
            "Unprocessable Entity"
          );
        }

        if (orderProduct.available_stock < product.quantity) {
          stockOut = `${orderProduct.p_name_en} is out of stock!`;
        }

        total += Number(orderProduct.special_price) * product.quantity;

        // Prepare inventory updates for batch processing
        inventoryUpdates.push({
          i_p_id: product.id,
          quantity: product.quantity,
        });

        productDetails.push({
          ep_id: orderProduct.p_id,
          ep_name_en: orderProduct.p_name_en,
          price: orderProduct.special_price,
          quantity: product.quantity,
          p_image: orderProduct.p_images?.map(
            (img: { image: string }) =>
              `${config.AWS_S3_BASE_URL}${ROOT_FOLDER}/${img.image}`
          ),
          v_id: product.v_id as number,
          p_color_id: product.p_color_id,
          size_id: product.size_id,
        });
      }

      // Throw error if any products are out of stock
      if (stockOut) {
        throw new CustomError(stockOut, 412, "Unprocessable Entity");
      }

      // Update inventory in bulk
      await trx("inventory")
        .whereIn(
          "i_p_id",
          inventoryUpdates.map((update) => update.i_p_id)
        )
        .update({
          i_quantity_available: trx.raw("i_quantity_available - ??", [
            inventoryUpdates.map((update) => update.quantity),
          ]),
          i_quantity_sold: trx.raw("i_quantity_sold + ??", [
            inventoryUpdates.map((update) => update.quantity),
          ]),
        });

      // Remove cart items in bulk
      if (cart_ids?.length) {
        await trx("cart_items").delete().whereIn("id", cart_ids);
      }

      // Calculate delivery charge
      let grand_total = total;
      let deliveryCharge = 0;
      if (!["AE", "OM"].includes(checkAddress.c_short_name)) {
        const deliveryData = await trx("delivery_charge")
          .select("usd", "gbp")
          .first();
        deliveryCharge = parseInt(deliveryData[currency.toLowerCase()] || "0");
        grand_total += deliveryCharge;
      }

      // Apply coupon discount
      let discount = 0;
      if (coupon) {
        const getCoupon = await trx("coupons")
          .select("discount", "discount_type")
          .where("id", coupon)
          .first();
        if (!getCoupon) {
          throw new CustomError(
            "Invalid coupon code",
            412,
            "Unprocessable Entity"
          );
        }

        if (getCoupon.discount_type === "percentage") {
          discount = (grand_total * Number(getCoupon.discount)) / 100;
        } else if (getCoupon.discount_type === "fixed") {
          discount = Number(getCoupon.discount);
        }
        grand_total -= discount;
      }

      // Generate order number
      let order_no = "1000";
      const getLastOrder = await trx("e_order")
        .select("order_no")
        .whereNotNull("order_no")
        .orderBy("order_no", "desc")
        .first();
      if (getLastOrder) {
        order_no = (parseInt(getLastOrder.order_no) + 1).toString();
      }

      // Create order
      const [orderId] = await trx("e_order").insert({
        ec_id,
        ecsa_id: address_id,
        total,
        discount,
        currency,
        order_no,
        coupon,
        delivery_charge: deliveryCharge,
        grand_total,
      });

      // Add order details in bulk
      const orderDetails = productDetails.map(({ p_image, ...item }) => ({
        ...item,
        eo_id: orderId,
      }));
      await trx("e_order_details").insert(orderDetails);

      // Prepare payment address
      const address = `${checkAddress.apt}, ${checkAddress.street_address}, ${checkAddress.city}, ${checkAddress.state}, ${checkAddress.c_name_en}, ${checkAddress.zip_code}`;

      // Initiate payment
      const { redirect_url } = await this.commonService.makeStripePayment({
        items: productDetails.map((item) => ({
          name: item.ep_name_en,
          amount: item.price,
          currency,
          image: item.p_image,
          quantity: item.quantity,
        })),
        currency,
        discount,
        deliveryCharge,
        taxAmount: 0,
        orderId: orderId.toString(),
        customer: {
          name: ec_name,
          email: ec_email,
          address,
        },
      });

      if (!redirect_url) {
        throw new CustomError("Payment Failure", 412, "Unprocessable Entity");
      }

      // Send notification
      await this.commonService.createNotification(
        "admin",
        {
          customer_id: 1,
          message: `An order has been created by ${ec_name} email:${ec_email} with total amount /- ${currency?.toUpperCase()} ${grand_total}`,
          related_id: orderId,
          type: "order",
        },
        trx
      );

      // Schedule order cancellation job
      this.cancelQueue.add(
        "sendCancelJob",
        { orderId },
        { attempts: 0, backoff: 5000, removeOnComplete: true, delay: 3600000 }
      );

      return {
        success: true,
        message: "Order placed!",
        data: { redirect_url },
      };
    });
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

    const products = await this.db("order_details_view as eod")
      .select("*")
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
