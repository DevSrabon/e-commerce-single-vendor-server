import { Request } from "express";
import { db } from "../../../app/database";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommProductService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // Get All Offer Products
  public async getAllOfferProducts(req: Request) {
    const {
      limit,
      skip,
      name,
      tag,
      minPrice,
      maxPrice,
      colors,
      sizes,
      fabrics,
      sortBy = "p.base_special_price",
      sortOrder = "asc",
      offer_id,
    } = req.query;
    const currentDate = new Date().toISOString().split("T")[0];
    const parsedColor = colors ? JSON.parse(colors as string) : [];
    const parsedSize = sizes ? JSON.parse(sizes as string) : [];
    const parsedFabrics = fabrics ? JSON.parse(fabrics as string) : [];
    const data = await this.db("product_view as p")
      .select(
        "p.p_id as id",
        "p.p_name_en as p_name_en",
        "p.p_name_ar as p_name_ar",
        "p.is_featured",
        "p.all_images as images",
        "p.base_price",
        "p.base_special_price",
        "p.p_slug as slug",
        "p.available_stock",
        "p.p_tags as tags",
        "p.offer_details"
      )
      .where((qb) => {
        qb.where("p.p_status", 1);
        qb.andWhere(
          this.db.raw(
            "JSON_UNQUOTE(JSON_EXTRACT(p.offer_details, '$.start_date')) <= ?",
            [currentDate]
          )
        );
        qb.andWhere(
          this.db.raw(
            "JSON_UNQUOTE(JSON_EXTRACT(p.offer_details, '$.end_date')) >= ?",
            [currentDate]
          )
        );

        qb.andWhere(
          this.db.raw(
            "JSON_EXTRACT(p.offer_details, '$.offer_discount') IS NOT NULL"
          )
        );
        if (offer_id) {
          qb.andWhere(
            this.db.raw(
              "JSON_UNQUOTE(JSON_EXTRACT(p.offer_details, '$.offer_id')) = ?",
              [offer_id]
            )
          );
        }
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

        if (minPrice || maxPrice) {
          if (minPrice && maxPrice) {
            qb.andWhereBetween("p.base_special_price", [minPrice, maxPrice]);
          }
          if (minPrice && !maxPrice) {
            qb.andWhere("p.base_special_price", ">=", minPrice);
          }
          if (!minPrice && maxPrice) {
            qb.andWhere("p.base_special_price", "<=", maxPrice);
          }
        }
        if (Array.isArray(parsedColor) && parsedColor.length) {
          parsedColor.forEach((color) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.colors, JSON_OBJECT('color_id', ?), '$')",
              [color]
            );
          });
        }

        if (Array.isArray(parsedSize) && parsedSize.length) {
          parsedSize.forEach((size) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.sizes, JSON_OBJECT('size_id', ?), '$')",
              [size]
            );
          });
        }
        if (Array.isArray(parsedFabrics) && parsedFabrics.length) {
          parsedFabrics.forEach((fabric) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.variants, JSON_OBJECT('fabric_id', ?), '$')",
              [fabric]
            );
          });
        }
      })
      .orderBy(sortBy as string, sortOrder as string)
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((skip as string) || "0"));

    const total = await this.db("product_view as p")
      .count("p_id as total")
      .where((qb) => {
        qb.where("p.p_status", 1);
        qb.andWhere(
          this.db.raw(
            "JSON_UNQUOTE(JSON_EXTRACT(p.offer_details, '$.start_date')) <= ?",
            [currentDate]
          )
        );
        qb.andWhere(
          this.db.raw(
            "JSON_UNQUOTE(JSON_EXTRACT(p.offer_details, '$.end_date')) >= ?",
            [currentDate]
          )
        );
        qb.andWhere(
          this.db.raw(
            "JSON_EXTRACT(p.offer_details, '$.offer_discount') IS NOT NULL"
          )
        );
        if (offer_id) {
          qb.andWhere(
            this.db.raw(
              "JSON_UNQUOTE(JSON_EXTRACT(p.offer_details, '$.offer_id')) = ?",
              [offer_id]
            )
          );
        }

        if (Array.isArray(parsedColor) && parsedColor.length) {
          parsedColor.forEach((color) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.colors, JSON_OBJECT('color_id', ?), '$')",
              [color]
            );
          });
        }

        if (Array.isArray(parsedSize) && parsedSize.length) {
          parsedSize.forEach((size) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.sizes, JSON_OBJECT('size_id', ?), '$')",
              [size]
            );
          });
        }
        if (Array.isArray(parsedFabrics) && parsedFabrics.length) {
          parsedFabrics.forEach((fabric) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.variants, JSON_OBJECT('fabric_id', ?), '$')",
              [fabric]
            );
          });
        }
      });

    return {
      success: true,
      message: "Get all offer products successfully",
      total: total[0]?.total || 0,
      data: data,
    };
  }

  // Get Best selling products
  public async getBestSellingProducts(req: Request) {
    const {
      limit,
      skip,
      name,
      tag,
      minPrice,
      maxPrice,
      colors,
      sizes,
      fabrics,
      sortBy = "total_sold",
      sortOrder = "desc",
    } = req.query;
    const parsedColor = colors ? JSON.parse(colors as string) : [];
    const parsedSize = sizes ? JSON.parse(sizes as string) : [];
    const parsedFabrics = fabrics ? JSON.parse(fabrics as string) : [];
    const data = await this.db("product_view as p")
      .select(
        "p.p_id",
        "p.p_name_en",
        "p.p_name_ar",
        "p.available_stock",
        "p.base_price",
        "p.base_special_price",
        "p.all_images",
        this.db.raw("SUM(op.quantity) as total_sold") // Aggregate total sold
      )
      .join("e_order_details as op", "p.p_id", "op.ep_id")
      .where((qb) => {
        qb.andWhere("p.p_status", 1);
        if (name) {
          qb.andWhere("p.p_name_en", "like", `%${name}%`).orWhere(
            "p.p_name_ar",
            "like",
            `%${name}%`
          );
        }
        if (tag) {
          qb.andWhere("p.p_tags", "like", `%${tag}%`);
        }
        if (minPrice || maxPrice) {
          if (minPrice && maxPrice) {
            qb.andWhereBetween("p.base_special_price", [minPrice, maxPrice]);
          }
          if (minPrice && !maxPrice) {
            qb.andWhere("p.base_special_price", ">=", minPrice);
          }
          if (!minPrice && maxPrice) {
            qb.andWhere("p.base_special_price", "<=", maxPrice);
          }
        }

        if (Array.isArray(parsedColor) && parsedColor.length) {
          parsedColor.forEach((color) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.colors, JSON_OBJECT('color_id', ?), '$')",
              [color]
            );
          });
        }

        if (Array.isArray(parsedSize) && parsedSize.length) {
          parsedSize.forEach((size) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.sizes, JSON_OBJECT('size_id', ?), '$')",
              [size]
            );
          });
        }
        if (Array.isArray(parsedFabrics) && parsedFabrics.length) {
          parsedFabrics.forEach((fabric) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.variants, JSON_OBJECT('fabric_id', ?), '$')",
              [fabric]
            );
          });
        }
      })
      .groupBy("p.p_id")
      .orderBy(sortBy as string, sortOrder as string)
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((skip as string) || "0"));

    const total = await this.db("product_view as p")
      .countDistinct("p.p_id as total")
      .join("e_order_details as op", "p.p_id", "op.ep_id")
      .where((qb) => {
        qb.andWhere("p.p_status", 1);
        if (name) {
          qb.andWhere("p.p_name_en", "like", `%${name}%`).orWhere(
            "p.p_name_ar",
            "like",
            `%${name}%`
          );
        }
        if (tag) {
          qb.andWhere("p.p_tags", "like", `%${tag}%`);
        }
        if (minPrice || maxPrice) {
          if (minPrice && maxPrice) {
            qb.andWhereBetween("p.base_special_price", [minPrice, maxPrice]);
          }
          if (minPrice && !maxPrice) {
            qb.andWhere("p.base_special_price", ">=", minPrice);
          }
          if (!minPrice && maxPrice) {
            qb.andWhere("p.base_special_price", "<=", maxPrice);
          }
        }

        if (Array.isArray(parsedColor) && parsedColor.length) {
          parsedColor.forEach((color) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.colors, JSON_OBJECT('color_id', ?), '$')",
              [color]
            );
          });
        }

        if (Array.isArray(parsedSize) && parsedSize.length) {
          parsedSize.forEach((size) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.sizes, JSON_OBJECT('size_id', ?), '$')",
              [size]
            );
          });
        }
        if (Array.isArray(parsedFabrics) && parsedFabrics.length) {
          parsedFabrics.forEach((fabric) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.variants, JSON_OBJECT('fabric_id', ?), '$')",
              [fabric]
            );
          });
        }
      });

    return {
      success: true,
      message: "Best selling products fetched successfully",
      data,
      total: total[0].total,
    };
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
      minPrice,
      maxPrice,
      colors,
      sizes,
      fabrics,
      name,
      featured,
    } = req.query;
    const parsedColor = colors ? JSON.parse(colors as string) : [];
    const parsedSize = sizes ? JSON.parse(sizes as string) : [];
    const parsedFabrics = fabrics ? JSON.parse(fabrics as string) : [];
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
        "p.colors",
        "p.sizes",
        "p.variants",
        "p.all_images as images",
        "p.base_price",
        "p.base_special_price",
        "p.p_slug as slug",
        "p.available_stock",
        "p.p_tags as tags",
        "p.avg_rating"
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
        } else {
          qb.andWhere("p.is_featured", 0);
        }

        if (minPrice || maxPrice) {
          if (minPrice && maxPrice) {
            qb.andWhereBetween("p.base_special_price", [minPrice, maxPrice]);
          }
          if (minPrice && !maxPrice) {
            qb.andWhere("p.base_special_price", ">=", minPrice);
          }
          if (!minPrice && maxPrice) {
            qb.andWhere("p.base_special_price", "<=", maxPrice);
          }
        }
        if (Array.isArray(parsedColor) && parsedColor.length) {
          parsedColor.forEach((color) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.colors, JSON_OBJECT('color_id', ?), '$')",
              [color]
            );
          });
        }

        if (Array.isArray(parsedSize) && parsedSize.length) {
          parsedSize.forEach((size) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.sizes, JSON_OBJECT('size_id', ?), '$')",
              [size]
            );
          });
        }
        if (Array.isArray(parsedFabrics) && parsedFabrics.length) {
          parsedFabrics.forEach((fabric) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.variants, JSON_OBJECT('fabric_id', ?), '$')",
              [fabric]
            );
          });
        }
      })
      .orderBy(orderBy, serial);

    const totalQuery = this.db("product_view as p")
      .count("p.p_id as total")
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
        } else {
          qb.andWhere("p.is_featured", 0);
        }

        if (minPrice || maxPrice) {
          if (minPrice && maxPrice) {
            qb.andWhereBetween("p.base_special_price", [minPrice, maxPrice]);
          }
          if (minPrice && !maxPrice) {
            qb.andWhere("p.base_special_price", ">=", minPrice);
          }
          if (!minPrice && maxPrice) {
            qb.andWhere("p.base_special_price", "<=", maxPrice);
          }
        }
        if (Array.isArray(parsedColor) && parsedColor.length) {
          parsedColor.forEach((color) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.colors, JSON_OBJECT('color_id', ?), '$')",
              [color]
            );
          });
        }

        if (Array.isArray(parsedSize) && parsedSize.length) {
          parsedSize.forEach((size) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.sizes, JSON_OBJECT('size_id', ?), '$')",
              [size]
            );
          });
        }
        if (Array.isArray(parsedFabrics) && parsedFabrics.length) {
          parsedFabrics.forEach((fabric) => {
            qb.andWhereRaw(
              "JSON_CONTAINS(p.variants, JSON_OBJECT('fabric_id', ?), '$')",
              [fabric]
            );
          });
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

  // Get All Attributes
  public async getAllAttributes(req: Request) {
    const colors = await this.db("color")
      .select("id", "color_en", "color_ar", "code")
      .where("is_active", 1);
    const sizes = await this.db("size")
      .select("id", "size")
      .where("is_active", 1);
    const fabrics = await this.db("fabric")
      .select("id", "name_en", "name_ar")
      .where("is_active", 1);

    return {
      success: true,
      message: "Attributes fetched successfully",
      data: {
        colors,
        sizes,
        fabrics,
      },
    };
  }

  // get product for order by id array
  public async getProductForOrder(
    id: number,
    p_size_id: number,
    v_id: number,
    p_color_id: number
  ) {
    const data = await this.db("product_view as p")
      .select(
        "p.p_id",
        "p.available_stock",
        "p.p_name_en",
        "p.p_name_ar",
        "p.p_images",
        "vp.id as variant_id",
        "vp.price as variant_price",
        "vp.discount",
        "vp.discount_type",
        this.db.raw(`
          FORMAT(
            CASE
              WHEN (o.id IS NOT NULL AND CURDATE() BETWEEN o.start_date AND o.end_date) THEN
                CASE
                  WHEN op.op_discount_type = 'percentage' THEN vp.price - (vp.price * (op.op_discount / 100))
                  WHEN op.op_discount_type = 'fixed' THEN vp.price - op.op_discount
                  ELSE vp.price
                END
              ELSE
                CASE
                  WHEN vp.discount_type = 'percentage' THEN vp.price - (vp.price * (vp.discount / 100))
                  WHEN vp.discount_type = 'fixed' THEN vp.price - vp.discount
                  ELSE vp.price
                END
            END, 2
          ) AS special_price
        `)
      )
      .join("variant_product as vp", "vp.p_id", "=", "p.p_id")
      .leftJoin("offer_products as op", "vp.p_id", "=", "op.p_id")
      .leftJoin("offers as o", function () {
        this.on("op.offer_id", "=", "o.id").andOn("o.status", "=", db.raw("1"));
      })
      .where("p.p_id", id)
      .andWhere("vp.id", v_id)
      .andWhere("vp.size_id", p_size_id)
      .andWhere("vp.color_id", p_color_id)
      .andWhere("p.p_status", 1)
      .andWhereNot("p.available_stock", null)
      .first();

    if (!data) {
      throw new Error(`Product with id ${id} not found or invalid variant.`);
    }

    return data;
  }
}

export default EcommProductService;
