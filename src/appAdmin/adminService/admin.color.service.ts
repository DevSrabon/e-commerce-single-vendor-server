import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminColorService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //   create a color
  public async createColor(req: Request) {
    const { name } = req.body;
    const checkColor = await this.db("color").select("id").where({ name });
    if (checkColor.length) {
      return {
        success: false,
        message: "Color already exist",
      };
    }

    const res = await this.db("color").insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: "Color created",
      };
    } else {
      return {
        success: false,
        message: "Cannot create color",
      };
    }
  }

  //   get all colors
  public async getAllColors(req: Request) {
    const { limit, page, name, code, is_active } = req.query;
    const res = await this.db("color")
      .select("*")
      .where((qb) => {
        if (name) {
          qb.andWhere("name", "like", `%${name}%`);
        }
        if (code) {
          qb.andWhere("code", "like", `%${code}%`);
        }
        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      })
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((page as string) || "0"));
    const total = await this.db("color")
      .count("id as total")
      .where((qb) => {
        if (name) {
          qb.andWhere("name", "like", `%${name}%`);
        }
        if (code) {
          qb.andWhere("code", "like", `%${code}%`);
        }
        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      });
    if (res.length) {
      return {
        success: true,
        total: total[0].total,
        data: res,
      };
    } else {
      return {
        success: false,
        message: "No color found",
      };
    }
  }

  //   update single color
  public async updateSingleColor(req: Request) {
    const { id } = req.params;
    const checkColor = await this.db("color").select("id").where({ id });
    if (!checkColor.length) {
      return {
        success: false,
        message: "Color not found with this id",
      };
    }
    const checkColorName = await this.db("color").select("id").where({ name });
    if (checkColorName.length) {
      return {
        success: false,
        message: "Color already exist",
      };
    }
    await this.db("color").update(req.body).where({ id });
    return {
      success: true,
      message: "Color updated successfully",
    };
  }

  //   delete single color
  public async deleteSingleColor(req: Request) {
    const { id } = req.params;
    const checkColor = await this.db("color").select("id").where({ id });
    if (!checkColor.length) {
      return {
        success: false,
        message: "Color not found with this id",
      };
    }
    const checkColorInProduct = await this.db("p_color")
      .select("color_id")
      .where({ color_id: id });
    if (checkColorInProduct.length) {
      return {
        success: false,
        message:
          "Already have color in product so you cannot delete this color",
      };
    }

    await this.db("color").delete().where({ id });
    return {
      success: true,
      message: "Color deleted successfully",
    };
  }
}
export default AdminColorService;
