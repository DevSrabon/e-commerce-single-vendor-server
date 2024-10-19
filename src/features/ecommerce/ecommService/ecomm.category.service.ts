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
      according_order = "asc",
      cate_name_en,
    } = req.query;

    const dtbs = this.db("category");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }

    const category = await dtbs
      .select(
        "cate_id",
        "cate_name_en",
        "cate_name_ar",
        "cate_status",
        "cate_image",
        "cate_slug",
        "cate_parent_id"
      )
      .where(function () {
        if (cate_name_en) {
          this.where("cate_name_en", "like", `%${cate_name_en}%`);
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

    const categories = category.map((item: any) => ({
      id: item.cate_id,
      cate_name_en: item.cate_name_en,
      cate_name_ar: item.cate_name_ar,
      cate_slug: item.cate_slug,
      cate_status: item.cate_status,
      cate_image: item.cate_image,
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
