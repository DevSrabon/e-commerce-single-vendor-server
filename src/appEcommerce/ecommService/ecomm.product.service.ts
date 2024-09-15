import EcommAbstractServices from '../ecommAbstracts/ecomm.abstract.service';
import { Request } from 'express';

class EcommProductService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // Get ecommerce product service
  public async getEcommProductService(req: Request) {
    const { category, limit, skip, tag, shortBy, serialBy, name } = req.query;
    let orderBy: string = 'epv.p_name';
    let serial: string = 'asc';
    let total: number = 0;
    if (shortBy) {
      orderBy = `epv.${shortBy}`;
    }
    if (serialBy) {
      serial = serialBy as string;
    }
    const query = this.db('e_product_view as epv')
      .select(
        'epv.ep_id as id',
        'epv.p_name as name',
        'epv.p_organic as organic',
        'epv.ep_price as price',
        'epv.p_images as images',
        'epv.p_attribute as attribute',
        'epv.ep_sale_price as sale_price',
        'epv.ep_details as details',
        'epv.p_unit as unit',
        'epv.p_slug as slug',
        'epv.available_stock',
        'epv.p_tags as tags'
      )
      .andWhere((qb) => {
        qb.andWhere('epv.ep_status', 1);

        if (tag) {
          qb.andWhere('epv.p_tags', 'like', `%${tag}%`);
        }
        if (name) {
          qb.andWhere('epv.p_name', 'like', `%${name}%`);
        }
      })
      .orderBy(orderBy, serial);

    const totalQuery = this.db('e_product_view as epv')
      .count('epv.ep_id as total')
      .andWhere((qb) => {
        if (tag) {
          qb.andWhere('epv.p_tags', 'like', `%${tag}%`);
        }
        if (name) {
          qb.andWhere('epv.p_name', 'like', `%${name}%`);
        }
      });

    if (category) {
      query
        .leftJoin('product_category as pc', 'epv.p_id', 'pc.pc_p_id')
        .leftJoin('category as c', 'pc.pc_cate_id', 'c.cate_id')
        .andWhere('c.cate_slug', category);
      totalQuery
        .leftJoin('product_category as pc', 'epv.p_id', 'pc.pc_p_id')
        .leftJoin('category as c', 'pc.pc_cate_id', 'c.cate_id')
        .andWhere('c.cate_slug', category);
    }

    if (limit && skip) {
      query.limit(parseInt(limit as string)).offset(parseInt(skip as string));
    }

    total = (await totalQuery)[0].total as number;

    const data = await query;

    return {
      success: true,
      data,
      total,
    };
  }

  // get Single product service
  public async getEcommSingleProduct(product: string) {
    const data = await this.db('e_product_view')
      .select(
        'ep_id as id',
        'p_name as name',
        'p_organic as organic',
        'p_images as images',
        'p_slug as slug',
        'ep_price as price',
        'ep_sale_price as sale_price',
        'ep_details as details',
        'p_unit as unit',
        'available_stock',
        'p_tags as tags',
        'categories',
        'p_attribute as attribute'
      )
      .andWhere('ep_status', 1)
      .andWhere('p_slug', product);

    if (!data.length) {
      return {
        success: false,
        message: 'No product found',
      };
    }

    return {
      success: true,
      data: data[0],
    };
  }

  // get product for order by id array
  public async getProductForOrder(ids: number[]) {
    const data = await this.db('e_product_view')
      .select('ep_id', 'ep_sale_price', 'available_stock', 'p_name')
      .whereIn('ep_id', ids)
      .andWhere('ep_status', 1)
      .andWhereNot('available_stock', null);
    return data;
  }
}

export default EcommProductService;
