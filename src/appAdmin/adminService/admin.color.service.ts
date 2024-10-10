import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminColorService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //   create a color
  public async createColor(req: Request) {
    const { color_en, color_ar } = req.body;
    const checkColor = await this.db("color")
      .select("id")
      .where({ color_en })
      .orWhere({ color_ar });
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
    const {
      limit,
      page,
      color,
      code,
      is_active,
      sortBy = "created_at",
      orderBy = "desc",
    } = req.query;

    const res = await this.db("color")
      .select("*")
      .where((qb) => {
        if (color) {
          qb.andWhere("color_en", "like", `%${color}%`).orWhere(
            "color_ar",
            "like",
            `%${color}%`
          );
        }
        if (code) {
          qb.andWhere("code", "like", `%${code}%`);
        }
        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      })
      .orderBy(sortBy as string, orderBy as string)
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((page as string) || "0"));
    const total = await this.db("color")
      .count("id as total")
      .where((qb) => {
        if (color) {
          qb.andWhere("color_en", "like", `%${color}%`).orWhere(
            "color_ar",
            "like",
            `%${color}%`
          );
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
    const { color_en, color_ar } = req.body;
    const checkColor = await this.db("color").select("id").where({ id });
    if (!checkColor.length) {
      return {
        success: false,
        message: "Color not found with this id",
      };
    }
    if (color_en || color_ar) {
      const checkColorName = await this.db("color")
        .select("id")
        .where(function () {
          if (color_en) {
            this.where({ color_en });
          }
          if (color_ar) {
            this.orWhere({ color_ar });
          }
        });
      if (checkColorName.length) {
        return {
          success: false,
          message: "Color already exist",
        };
      }
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

  // create size
  public async createSize(req: Request) {
    const { size } = req.body;
    const checkSize = await this.db("size").select("id").where({ size });
    if (checkSize.length) {
      return {
        success: false,
        message: "Size already exist",
      };
    }
    const res = await this.db("size").insert(req.body);
    if (res.length) {
      return {
        success: true,
        message: "Size created",
      };
    } else {
      return {
        success: false,
        message: "Cannot create size",
      };
    }
  }

  // get all size
  public async getAllSize(req: Request) {
    const { limit, page, size, is_active } = req.query;
    const res = await this.db("size")
      .select("*")
      .where((qb) => {
        if (size) {
          qb.andWhere("size", "like", `%${size}%`);
        }

        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      })
      .orderBy("updated_at", "desc")
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((page as string) || "0"));
    const total = await this.db("size")
      .count("id as total")
      .where((qb) => {
        if (size) {
          qb.andWhere("size", "like", `%${size}%`);
        }
        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      });

    return {
      success: true,
      message: "Size fetched successfully",
      total: total[0].total,
      data: res,
    };
  }

  //   update single size
  public async updateSingleSize(req: Request) {
    const { id } = req.params;
    const checkSize = await this.db("size").select("id").where({ id });
    if (!checkSize.length) {
      return {
        success: false,
        message: "Size not found with this id",
      };
    }
    if (req.body.size) {
      const checkSizeName = await this.db("size")
        .select("id")
        .where({ size: req.body.size });
      if (checkSizeName.length) {
        return {
          success: false,
          message: "Size already exist",
        };
      }
    }
    await this.db("size").update(req.body).where({ id });
    return {
      success: true,
      message: "Size updated successfully",
    };
  }

  //   delete single size
  public async deleteSingleSize(req: Request) {
    const { id } = req.params;
    const checkSize = await this.db("size").select("id").where({ id });
    if (!checkSize.length) {
      return {
        success: false,
        message: "Size not found with this id",
      };
    }
    const checkSizeInProduct = await this.db("p_size")
      .select("size_id")
      .where({ size_id: id });
    if (checkSizeInProduct.length) {
      return {
        success: false,
        message: "Already have size in product so you cannot delete this size",
      };
    }

    await this.db("size").delete().where({ id });
    return {
      success: true,
      message: "Size deleted successfully",
    };
  }

  // create fabric
  public async createFabric(req: Request) {
    const { name_en, name_ar } = req.body;
    const checkFabric = await this.db("fabric")
      .select("id")
      .where(function () {
        this.where({ name_en }).orWhere({ name_ar });
      });
    if (checkFabric.length) {
      return {
        success: false,
        message: "Fabric already exist",
      };
    }
    const res = await this.db("fabric").insert(req.body);
    if (res.length) {
      return {
        success: true,
        message: "Fabric created",
      };
    } else {
      return {
        success: false,
        message: "Cannot create fabric",
      };
    }
  }

  // get all fabric
  public async getAllFabric(req: Request) {
    const { limit, page, name_ar, name_en, is_active } = req.query;
    const res = await this.db("fabric")
      .select("*")
      .where((qb) => {
        if (name_en) {
          qb.andWhere("name", "like", `%${name_en}%`);
        }
        if (name_ar) {
          qb.andWhere("name", "like", `%${name_ar}%`);
        }
        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      })
      .orderBy("updated_at", "desc")
      .limit(parseInt((limit as string) || "100"))
      .offset(parseInt((page as string) || "0"));
    const total = await this.db("fabric")
      .count("id as total")
      .where((qb) => {
        if (name_en) {
          qb.andWhere("name", "like", `%${name_en}%`);
        }
        if (name_ar) {
          qb.andWhere("name", "like", `%${name_ar}%`);
        }
        if (is_active) {
          qb.andWhere("is_active", is_active);
        }
      });

    return {
      success: true,
      message: "Fabric fetched successfully",
      total: total[0].total,
      data: res,
    };
  }

  //   update single fabric
  public async updateSingleFabric(req: Request) {
    const { id } = req.params;
    const { name_en, name_ar } = req.body;
    const checkFabric = await this.db("fabric").select("id").where({ id });
    if (!checkFabric.length) {
      return {
        success: false,
        message: "Fabric not found with this id",
      };
    }
    if (name_en || name_ar) {
      const checkFabricName = await this.db("fabric")
        .select("id")
        .where(function () {
          this.where({ name_en }).orWhere({ name_ar });
        });
      if (checkFabricName.length) {
        return {
          success: false,
          message: "Fabric already exist",
        };
      }
    }
    await this.db("fabric").update(req.body).where({ id });
    return {
      success: true,
      message: "Fabric updated successfully",
    };
  }

  //   delete single fabric
  public async deleteSingleFabric(req: Request) {
    const { id } = req.params;
    const checkFabric = await this.db("fabric").select("id").where({ id });
    if (!checkFabric.length) {
      return {
        success: false,
        message: "Fabric not found with this id",
      };
    }
    const checkFabricInProduct = await this.db("product_variation")
      .select("fabric_id")
      .where({ fabric_id: id });
    if (checkFabricInProduct.length) {
      return {
        success: false,
        message:
          "Already have fabric in product so you cannot delete this fabric",
      };
    }

    await this.db("fabric").delete().where({ id });
    return {
      success: true,
      message: "Fabric deleted successfully",
    };
  }
}
export default AdminColorService;
