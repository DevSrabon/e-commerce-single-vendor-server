import EcommAbstractServices from '../ecommAbstracts/ecomm.abstract.service';
import EcommProductService from './ecomm.product.service';
import { Request } from 'express';

interface IOrderProduct {
  id: number;
  av_id?: number;
  quantity: number;
}

interface IOrderProductDetails {
  eod_ep_id: number;
  eod_eo_id?: number;
  eod_ep_name: string;
  eod_price: number;
  eod_quantity: number;
  eod_av_id: number;
}

class EcommOrderService extends EcommAbstractServices {
  private ecommProductService = new EcommProductService();
  constructor() {
    super();
  }

  // customer place order service
  public async ecommPlaceOrderService(req: Request) {
    const { ec_id } = req.customer;
    const { address_id, products, delivery_charge } = req.body;
    const pId: number[] = products.map((item: IOrderProduct) => item.id);

    const orderProduct = await this.ecommProductService.getProductForOrder(pId);
    console.log({ orderProduct });
    if (pId.length !== orderProduct.length) {
      return {
        success: false,
        message: 'Some of product are not available of this order',
      };
    }

    let total = 0;
    let stockOut: string | null = null;

    const productDetails: IOrderProductDetails[] = products.map(
      (item: IOrderProduct) => {
        const currProduct = orderProduct.find(
          (item2) => item2.ep_id === parseInt(item.id.toString())
        );

        if (currProduct?.available_stock < item.quantity) {
          stockOut = `${currProduct.p_name} is out of stock!`;
        }
        total += parseInt(currProduct.ep_sale_price);
        return {
          eod_ep_id: currProduct.ep_id,
          eod_ep_name: currProduct.p_name,
          eod_price: currProduct.ep_sale_price,
          eod_quantity: item.quantity,
          eod_av_id: item.av_id || null,
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
      const order = await trx('e_order').insert({
        eo_ec_id: ec_id,
        eo_ecsa_id: address_id,
        eo_total: total,
        eo_delivery_charge: delivery_charge,
        eo_grand_total: total + parseInt(delivery_charge),
      });

      const currProductDetails = productDetails.map((item) => {
        return { ...item, eod_eo_id: order[0] };
      });

      await trx('e_order_details').insert(currProductDetails);

      return {
        success: true,
        message: 'Order placed!',
        data: {
          order_id: order[0],
        },
      };
    });
  }

  // get order of customer service
  public async ecommGetOrderService(req: Request) {
    const { ec_id } = req.customer;
    const data = await this.db('e_order')
      .select(
        'eo_id as id',
        'eo_status as order_status',
        'eo_payment_status as payment_status',
        'eo_grand_total as grand_total',
        'eo_created_at as order_date'
      )
      .where('eo_ec_id', ec_id);

    return {
      success: true,
      data,
    };
  }

  // get single order service
  public async getSingleOrderSirvice(req: Request) {
    const { ec_id } = req.customer;
    const { id } = req.params;

    const order = await this.db('e_order')
      .select(
        'eo_id as id',
        'eo_ecsa_id',
        'eo_status as order_status',
        'eo_payment_status as payment_status',
        'eo_total as sub_total',
        'eo_delivery_charge as delivery_charge',
        'eo_discount as discount',
        'eo_grand_total as grand_total',
        'eo_created_at as order_create_date'
      )
      .andWhere('eo_ec_id', ec_id)
      .andWhere('eo_id', id);

    if (!order.length) {
      return {
        success: false,
        message: 'No order found!',
      };
    }
    const { eo_ecsa_id, ...rest } = order[0];

    const address = await this.db('ec_shipping_address as esa')
      .select(
        'esa.ecsa_id as id',
        'esa.ecsa_label as label',
        'esa.ecsa_name as name',
        'esa.ecsa_phone as phone',
        'esa.ecsa_address as address',
        'av.area_id',
        'av.area_name',
        'av.sub_city_id',
        'av.sub_city_name',
        'av.city_id',
        'av.city_name',
        'av.province_id',
        'av.province_name'
      )
      .join('address_view as av', 'esa.ecsa_ar_id', 'av.area_id')
      .where('ecsa_id', eo_ecsa_id);

    const products = await this.db('e_order_details as eod')
      .select(
        'eod.eod_id as id',
        'eod.eod_ep_name as name',
        'eod.eod_price as price',
        'eod.eod_quantity as quantity',
        'av.av_id',
        'av.av_value',
        'a.a_name as attribute'
      )
      .leftJoin('attribute_value as av', 'eod.eod_av_id', 'av.av_id')
      .leftJoin('attribute as a', 'av.av_a_id', 'a.a_id')
      .where('eod_eo_id', id);

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
