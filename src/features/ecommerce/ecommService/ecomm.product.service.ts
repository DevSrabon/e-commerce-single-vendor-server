import { Request } from "express";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommProductService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // Get ecommerce product service
  public async getEcommProductService(req: Request) {
    const {
      category,
      limit,
      skip,
      tag,
      shortBy,
      serialBy,
      name,
      featured = 1,
    } = req.query;
    let orderBy: string = "p.p_created_at";
    let serial: string = "desc";
    let total: number = 0;
    if (shortBy) {
      orderBy = `p.${shortBy}`;
    }
    if (serialBy) {
      serial = serialBy as string;
    }
    const query = this.db("product_view as p")
      .select(
        "p.p_id as id",
        "p.p_name_en as p_name_en",
        "p.p_name_ar as p_name_ar",
        "p.is_featured",
        "p.p_images as images",
        "p.variants",
        "p.base_price",
        "p.base_special_price",
        "p.p_slug as slug",
        "p.available_stock",
        "p.p_tags as tags"
      )
      .andWhere((qb) => {
        qb.andWhere("p.p_status", 1);

        if (tag) {
          qb.andWhere("p.p_tags", "like", `%${tag}%`);
        }
        if (name) {
          qb.andWhere("p.p_name_en", "like", `%${name}%`).orWhere(
            "p.p_name_ar",
            "like",
            `%${name}%`
          );
        }
        if (featured) {
          qb.andWhere("p.is_featured", 1);
        }
      })
      .orderBy(orderBy, serial);

    const totalQuery = this.db("product_view as p")
      .count("p.p_id as total")
      .andWhere((qb) => {
        if (tag) {
          qb.andWhere("p.p_tags", "like", `%${tag}%`);
        }
        if (name) {
          qb.andWhere("p.p_name_en", "like", `%${name}%`).orWhere(
            "p.p_name_ar",
            "like",
            `%${name}%`
          );
        }
      });

    if (category) {
      query
        .leftJoin("product_category as pc", "p.p_id", "pc.pc_p_id")
        .leftJoin("category as c", "pc.pc_cate_id", "c.cate_id")
        .andWhere("c.cate_slug", category);
      totalQuery
        .leftJoin("product_category as pc", "p.p_id", "pc.pc_p_id")
        .leftJoin("category as c", "pc.pc_cate_id", "c.cate_id")
        .andWhere("c.cate_slug", category);
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
    const data = await this.db("product_view")
      .select(
        "*"
        // "ep_id as id",
        // "p_name_en as name",
        // "p_organic as organic",
        // "p_images as images",
        // "p_slug as slug",
        // "ep_price as price",
        // "ep_sale_price as sale_price",
        // "ep_details as details",
        // "p_unit as unit",
        // "available_stock",
        // "p_tags as tags",
        // "categories",
        // "p_attribute as attribute"
      )
      .andWhere("p_status", 1)
      .andWhere("p_slug", product);

    if (!data.length) {
      return {
        success: false,
        message: "No product found",
      };
    }

    return {
      success: true,
      data: data[0],
    };
  }

  // get product for order by id array
  public async getProductForOrder(ids: number[]) {
    const data = await this.db("product_view")
      .select("ep_id", "ep_sale_price", "available_stock", "p_name_en")
      .whereIn("ep_id", ids)
      .andWhere("p_status", 1)
      .andWhereNot("available_stock", null);
    return data;
  }
}

export default EcommProductService;
