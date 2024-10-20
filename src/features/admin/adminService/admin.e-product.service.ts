import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminEcommerceProductService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // add product into ecommerce
  public async addProductIntoEcommerceService(req: Request) {
    const { p_p_id, p_price, p_sale_price, p_details } = req.body;

    const checkProduct = await this.db("product_view")
      .select("p_name", "available_stock")
      .where({ p_id: p_p_id });

    if (!checkProduct.length) {
      return {
        success: false,
        message: "Cannot find this product with this id",
      };
    }

    if (!(checkProduct[0].available_stock > 0)) {
      return {
        success: false,
        message: "This product has not available stock, so you cannot add",
      };
    }

    const checkEProduct = await this.db("e_product")
      .select("p_price")
      .where({ p_p_id });

    if (checkEProduct.length) {
      return {
        success: false,
        message: "Already added this product into ecommerce",
      };
    }

    const res = await this.db("e_product").insert({
      p_p_id,
      p_price,
      p_sale_price,
      p_details,
    });

    if (res.length) {
      return {
        success: true,
        message: "Successfully product added into ecommerce",
      };
    } else {
      return {
        success: false,
        message: "Cannot product add into ecommerce",
      };
    }
  }

  //get all ecommerce product
  public async getAllEcommerceProductService(req: Request) {
    const { status, p_name, cate_id, from_date, to_date } = req.query;

    const endDate = new Date(to_date as string);

    endDate.setDate(endDate.getDate() + 1);

    const data = await this.db("product_view")
      .select(
        "p_id",
        "p_status",
        "p_id",
        "p_name_en",
        "p_name_ar",
        // "p_price",
        "available_stock",
        "p_images"
      )
      .where(function () {
        if (status) {
          this.where("p_status", status);
        }
        if (p_name) {
          this.andWhere("p_name", "Like", `%${p_name}%`);
        }
        if (cate_id) {
          this.andWhereRaw("JSON_CONTAINS(categories, ?)", [
            `{"cate_id": ${cate_id}}`,
          ]);
        }
        if (from_date && to_date) {
          this.andWhereBetween("p_created_at", [from_date, endDate]);
        }
      });

    return {
      success: true,
      data,
    };
  }

  // get single ecommerce product
  public async getSingleEcommerceProductService(req: Request) {
    const { id } = req.params;
    const data = await this.db("product_view AS epv")
      .select(
        "epv.p_id",
        "epv.p_price",
        "epv.p_sale_price",
        "epv.p_status",
        "epv.p_details",
        "epv.p_id",
        "epv.p_unit",
        "epv.p_name",
        "epv.p_slug",
        "epv.p_tags",
        "epv.available_stock",
        "epv.categories",
        "epv.p_images",
        "epv.p_attribute",
        "epv.p_created_at"
      )

      .where("epv.p_id", id);

    let pAttb = data[0]?.p_attribute;
    let pAttb2: any = [];

    for (let i = 0; i < pAttb?.length; i++) {
      let found = false;
      for (let j = 0; j < pAttb2.length; j++) {
        if (pAttb2[j].a_name === pAttb[i].a_name) {
          found = true;
          pAttb2[j].ab_values.push({
            v_id: pAttb[i].v_id,
            av_value: pAttb[i].av_value,
          });
        }
      }
      if (!found) {
        pAttb2.push({
          a_name: pAttb[i].a_name,
          ab_values: [
            {
              v_id: pAttb[i].v_id,
              av_value: pAttb[i].av_value,
            },
          ],
        });
      }
    }

    const inventoryAttbdata = await this.db("product_view AS epv")
      .select("iv.inventory_attribute")
      .join("inventory_view AS iv", "epv.p_id", "iv.i_p_id")
      .where("epv.p_id", id);

    const { categories, p_images, p_attribute, ...rest } = data[0];

    if (data.length) {
      return {
        success: true,
        data: {
          ...rest,
          categories,
          p_images,
          p_attribute: pAttb2,
          inventoryAttbdata,
        },
      };
    } else {
      return {
        success: false,
        message: "Ecommerce product not found with this e-product id",
      };
    }
  }

  // update ecommerce product
  public async updateEcommerceProductService(req: Request) {
    const { id } = req.params;

    const checkEProduct = await this.db("e_product")
      .select("p_id")
      .where({ p_id: id });

    if (!checkEProduct.length) {
      return {
        success: false,
        message: "Ecommerce product not found with this product id",
      };
    }

    const pdRes = await this.db("e_product")
      .update(req.body)
      .where({ p_id: id });

    if (pdRes) {
      return {
        success: true,
        message: "Ecommerce product update successfully",
      };
    } else {
      return {
        success: false,
        message: "Ecommerce product cannot update at this moment",
      };
    }
  }
}

export default AdminEcommerceProductService;
