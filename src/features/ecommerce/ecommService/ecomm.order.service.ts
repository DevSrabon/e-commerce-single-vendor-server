import { Request } from "express";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";
import EcommProductService from "./ecomm.product.service";

interface IOrderProduct {
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
}

class EcommOrderService extends EcommAbstractServices {
  private ecommProductService = new EcommProductService();
  constructor() {
    super();
  }

  // customer place order service
  public async ecommPlaceOrderService(req: Request) {
    const { ec_id } = req.customer;
    const { address_id, products, color_id, size_id, delivery_charge } =
      req.body;
    const pId: number[] = products.map((item: IOrderProduct) => item.id);
    console.log("🚀 ~ EcommOrderService ~ ecommPlaceOrderService ~ pId:", pId);
    const checkAddress = await this.db("ec_shipping_address")
      .select("ecsa_id")
      .where("ecsa_ec_id", ec_id)
      .andWhere("ecsa_id", address_id);

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
      (item: IOrderProduct) => {
        const currProduct = orderProduct.find(
          (item2) => item2.p_id === parseInt(item.id.toString())
        );
        console.log({
          currProduct,
        });
        if (currProduct?.available_stock < item.quantity) {
          stockOut = `${currProduct.p_name_en} is out of stock!`;
        }
        total += parseInt(currProduct.base_special_price);
        console.log(
          "🚀 ~ EcommOrderService ~ ecommPlaceOrderService ~ currProduct:",
          currProduct,
          total
        );
        return {
          ep_id: currProduct.ep_id,
          ep_name_en: currProduct.p_name_en,
          ep_name_ar: currProduct.p_name_ar,
          price: currProduct.base_special_price,
          quantity: item.quantity,
          v_id: item.v_id || null,
          color_id,
          size_id,
        };
      }
    );

    if (stockOut) {
      return {
        success: false,
        message: stockOut,
      };
    }

    return await this.db.transaction(async (trx) => {
      const order = await trx("e_order").insert({
        ec_id: ec_id,
        ecsa_id: address_id,
        total: total,
        delivery_charge: delivery_charge,
        grand_total: total + parseInt(delivery_charge),
      });

      const currProductDetails = productDetails.map((item) => {
        return { ...item, id: order[0] };
      });

      await trx("e_order_details").insert(currProductDetails);

      return {
        success: true,
        message: "Order placed!",
        data: {
          order_id: order[0],
        },
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
  public async getSingleOrderSirvice(req: Request) {
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
      .select(
        "esa.ecsa_id as id",
        "esa.ecsa_label as label",
        "esa.ecsa_name as name",
        "esa.ecsa_phone as phone",
        "esa.ecsa_address as address",
        "av.area_id",
        "av.area_name",
        "av.sub_city_id",
        "av.sub_city_name",
        "av.city_id",
        "av.city_name",
        "av.province_id",
        "av.province_name"
      )
      .join("address_view as av", "esa.ecsa_ar_id", "av.area_id")
      .where("ecsa_id", ecsa_id);

    const products = await this.db("e_order_details as eod")
      .select(
        "eod.id as id",
        "eod.ep_name as name",
        "eod.price as price",
        "eod.quantity as quantity",
        "av.v_id",
        "av.av_value",
        "a.a_name as attribute"
      )
      .leftJoin("attribute_value as av", "eod.v_id", "av.v_id")
      .leftJoin("attribute as a", "av.av_a_id", "a.a_id")
      .where("id", id);

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
