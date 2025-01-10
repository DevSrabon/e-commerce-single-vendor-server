import { Request } from "express";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommCategoryService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // get category service
  public async getCategory(req: Request) {
    const {
      status,
      parent,
      limit,
      skip = 0,
      order_by = "cate_name_en",
      is_banner,
      cate_home,
      according_order = "asc",
      cate_name,
    } = req.query;

    const dtbs = this.db("category");

    const categoryQuery = dtbs
      .select(
        "cate_id",
        "cate_name_en",
        "cate_name_ar",
        "is_banner",
        "cate_home",
        "cate_image",
        "cate_slug",
        "cate_parent_id"
      )
      .where(function () {
        if (cate_name) {
          this.where("cate_name_en", "like", `%${cate_name}%`).orWhere(
            "cate_name_ar",
            "like",
            `%${cate_name}%`
          );
        }
        if (is_banner) {
          this.andWhere({ is_banner });
        }
        if (cate_home) {
          this.andWhere({ cate_home });
        }
        if (status && parent) {
          this.andWhere("cate_status", status);
          if (parent === "null") {
            this.andWhere("cate_parent_id", null);
          } else {
            this.andWhere("cate_parent_id", parent);
          }
        } else if (status) {
          this.where("cate_status", status);
        } else if (parent) {
          if (parent === "null") {
            this.andWhere("cate_parent_id", null);
          } else {
            this.andWhere("cate_parent_id", parent);
          }
        }
      })
      .offset(parseInt(skip as string))
      .orderBy(order_by as string, according_order as string);
    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }

    const category = await categoryQuery;
    const categories = category.map((item: any) => ({
      id: item.cate_id,
      cate_name_en: item.cate_name_en,
      cate_name_ar: item.cate_name_ar,
      cate_slug: item.cate_slug,
      cate_status: item.cate_status,
      cate_image: item.cate_image,
      cate_home: item.cate_home,
      is_banner: item.is_banner,
      parentId: item.cate_parent_id,
      children: [],
    }));

    const categoryMap: any = {};

    categories.forEach((category) => {
      categoryMap[category.id] = category;
    });

    categories.forEach((category) => {
      const parentId = category.parentId;
      if (parentId !== null) {
        const parentCategory = categoryMap[parentId];
        if (parentCategory) {
          parentCategory.children.push(category);
        }
      }
    });

    const topLevelCategories = categories.filter(
      (category) => category.parentId === null
    );

    return {
      success: true,
      data: topLevelCategories,
    };
  }
}

export default EcommCategoryService;
