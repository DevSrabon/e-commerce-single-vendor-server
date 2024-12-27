import { Request } from "express";
import CustomError from "../../../utils/lib/customError";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommCartService extends EcommAbstractServices {
  constructor() {
    super();
  }

  public async addToCart(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { ec_id } = req.customer;
      const body = req.body as {
        p_id: number;
        v_id: number;
        p_color_id: number;
        size_id: number;
        quantity: number;
        mode?: "increment" | "decrement";
        type: "cart" | "favourite";
      };

      const { p_color_id, p_id, quantity, size_id, type, v_id, mode } = body;

      const checkProducts = await trx("product")
        .select("p_id")
        .where({ p_id })
        .first();
      if (!checkProducts) {
        throw new CustomError("Product not found", 404, "Not Found");
      }

      const checkColor = await trx("p_color")
        .select("id")
        .where("color_id", p_color_id)
        .andWhere("p_id", p_id)
        .first();
      if (!checkColor) {
        throw new CustomError("Color not found", 404, "Not Found");
      }
      const checkVariants = await trx("variant_product")
        .select("id")
        .where("id", v_id)
        .andWhere("p_id", p_id)
        .first();

      if (!checkVariants) {
        throw new CustomError("Variant not found", 404, "Not Found");
      }

      const checkSize = await trx("p_size")
        .where({ size_id })
        .andWhere({ p_id })
        .first();
      if (!checkSize) {
        throw new CustomError("Size not found", 404, "Not Found");
      }
      const checkCart = await trx("cart_items")
        .select("id", "quantity")
        .andWhere({ ec_id })
        .andWhere({ p_id })
        .andWhere({ v_id })
        .andWhere({ p_color_id })
        .andWhere({ size_id })
        .andWhere({ type })
        .first();
      if (checkCart) {
        if (mode === "increment") {
          await trx("cart_items")
            .where("id", checkCart.id)
            .increment("quantity", 1);
          return {
            success: true,
            message: `Successfully updated ${body.type}`,
          };
        }
        if (mode === "decrement") {
          if (checkCart.quantity === 1) {
            await trx("cart_items").delete().where("id", checkCart.id);
            return {
              success: true,
              message: `Successfully removed from ${body.type}`,
            };
          } else {
            await trx("cart_items")
              .where("id", checkCart.id)
              .decrement("quantity", 1);
          }
          return {
            success: true,
            message: `Successfully updated ${body.type}`,
          };
        }
      } else {
        await trx("cart_items").insert({
          ec_id,
          p_id,
          v_id,
          p_color_id,
          size_id,
          quantity,
          type,
        });
        return {
          success: true,
          message: `Successfully add to ${body.type}`,
        };
      }
    });
  }

  public async removeFromCart(req: Request) {
    const { ids, type } = req.body;
    const checkCart = await this.db("cart_items")
      .whereIn("id", ids)
      .andWhere({ type });
    if (!checkCart.length) {
      return {
        success: false,
        message: `${type} not found`,
      };
    }
    if (checkCart.length !== ids.length) {
      return {
        success: false,
        message: `Some ${type}s are missing!`,
      };
    }
    await this.db("cart_items").del().whereIn("id", ids).andWhere({ type });
    return {
      success: true,
      message: `${type} successfully deleted!`,
    };
  }

  //   Get all Cart Items
  public async getAllCarts(req: Request) {
    const { ec_id } = req.customer;
    const { limit, skip, type } = req.query;
    const date = new Date().toISOString().split("T")[0];

    const data = await this.db("cart_items as ci")
      .select(
        "ci.id",
        "p.p_id",
        "p.sku",
        "p.p_name_en",
        "p.p_name_ar",
        "p.p_slug",
        "vp.id",
        "ci.p_color_id",
        "ci.size_id",
        "ci.quantity",
        "c.color_en",
        "c.color_ar",
        "c.code",
        "s.size",
        "fab.name_en as fabric_name_en",
        "fab.name_ar as fabric_name_ar",
        this.db.raw(`
        CASE
          WHEN (offer_details.offer_id IS NOT NULL) THEN offer_details.op_discount
          ELSE vp.discount
        END AS discount
      `),
        this.db.raw(`
        CASE
          WHEN (offer_details.offer_id IS NOT NULL) THEN offer_details.op_discount_type
          ELSE vp.discount_type
        END as discount_type
      `),
        this.db.raw(`
        FORMAT(
          CASE
            WHEN (offer_details.offer_id IS NOT NULL) THEN
              CASE
                WHEN offer_details.op_discount_type = 'percentage' THEN (vp.price - (vp.price * (offer_details.op_discount / 100)))
                WHEN offer_details.op_discount_type = 'fixed' THEN (vp.price - offer_details.op_discount)
                ELSE vp.price
              END
            ELSE
              CASE
                WHEN vp.discount_type = 'percentage' THEN (vp.price - (vp.price * (vp.discount / 100)))
                WHEN vp.discount_type = 'fixed' THEN (vp.price - vp.discount)
                ELSE vp.price
              END
          END, 2
        ) AS special_price
      `)
      )
      .join("product as p", "p.p_id", "ci.p_id")
      .join("p_color as pc", "pc.id", "ci.p_color_id")
      .join("color as c", "c.id", "pc.color_id")
      .join("size as s", "s.id", "ci.size_id")
      .join("variant_product as vp", "vp.id", "ci.v_id")
      .leftJoin("fabric as fab", "fab.id", "vp.fabric_id")
      .leftJoin(
        this.db.raw(`
        (
          SELECT op.p_id, op.op_discount, op.op_discount_type, op.offer_id
          FROM offer_products AS op
          LEFT JOIN offers AS offers ON offers.id = op.offer_id
          WHERE offers.status = 1
          AND CURDATE() BETWEEN offers.start_date AND offers.end_date
        ) AS offer_details
      `),
        "offer_details.p_id",
        "ci.p_id"
      )
      .where({ ec_id })
      .andWhere({ type })
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((skip as string) || "0"));

    const total = await this.db("cart_items")
      .count("id as total")
      .andWhere({ type })
      .where({ ec_id });

    return {
      success: true,
      message: "Data successfully fetched",
      total: total[0].total,
      data,
    };
  }
}
export default EcommCartService;
