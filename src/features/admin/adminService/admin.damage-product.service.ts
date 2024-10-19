import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminDamageProductService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // add damage product
  public async addDamageProductService(req: Request) {
    const { p_damage, pd_product, pdp_variants } = req.body;
    // check warehouse
    const checkWarehouse = await this.db("warehouse")
      .select("w_name")
      .where({ w_id: p_damage.pd_w_id });

    if (!checkWarehouse.length) {
      return {
        success: false,
        message: "Warehouse does not found with this warehouse id",
      };
    }

    return await this.db.transaction(async (trx) => {
      const pdRes = await trx("p_damage").insert({
        pd_w_id: p_damage.pd_w_id,
        pd_details: p_damage.pd_details,
        pd_date: p_damage.pd_date,
        pd_created_by: p_damage.pd_created_by,
      });

      let pt_product_input: Object[] = [];

      pd_product.forEach((el: any) => {
        pt_product_input.push({
          pdp_pd_id: pdRes[0],
          pdp_p_id: el.pdp_p_id,
          pdp_quantity: el.pdp_quantity,
        });
      });

      const pdInputRes = await trx("pd_product").insert(pt_product_input);

      if (pdp_variants) {
        let ptp_attributeVal: Object[] = [];

        for (let h = 0; h < pd_product.length; h++) {
          for (let i = 0; i < pdp_variants.length; i++) {
            if (pd_product[h].pdp_p_id === pdp_variants[i].pdpa_pdp_id) {
              ptp_attributeVal.push({
                pdpa_v_id: pdp_variants[i].pdpa_v_id,
                pdpa_quantity: pdp_variants[i].pdpa_quantity,
                pdpa_pdp_id: pdInputRes[0] + h,
              });
            }
          }
        }

        await trx("pdp_variants").insert(ptp_attributeVal);
      }

      if (pdInputRes.length) {
        return {
          success: true,
          message: "Damage product added successfully",
        };
      } else {
        return {
          success: false,
          message: "Damage product cannot add at this moment",
        };
      }
    });
  }

  //get all damage product
  public async getAllDamageProductService(req: Request) {
    const { warehouse_id } = req.query;
    const data = await this.db("pd_product AS pdp")
      .select(
        "pd.p_id",
        "pd.p_name",
        "pdp.pdp_quantity",
        "pdm.pd_w_id",
        "wh.w_name"
      )
      .join("p_damage AS pdm", "pdp.pdp_pd_id", "pdm.pd_id")
      .join("product AS pd", "pdp.pdp_p_id", "pd.p_id")
      .join("warehouse AS wh", "pdm.pd_w_id", "wh.w_id")
      .where(function () {
        if (warehouse_id) {
          this.where("pdm.pd_w_id", warehouse_id);
        }
      });

    return {
      success: true,
      data,
    };
  }

  // get single damage product
  public async getSingleDamageProductService(req: Request) {
    const { id } = req.params;
    const data = await this.db("pd_product AS pdp")
      .select(
        "pd.p_id",
        "pd.p_name",
        "pdp.pdp_quantity",
        "pdm.pd_id",
        "pdm.pd_w_id",
        "wh.w_name",
        "wh.w_address",
        "wh.w_phone",
        "wh.w_email",
        "pdm.pd_details",
        "pdm.pd_date",
        "pdm.pd_created_by",
        "pdm.pd_created_at",
        "pdm.pd_details",
        "pda.pdpa_id",
        "pda.pdpa_v_id",
        "pda.pdpa_quantity",
        "av.av_value"
      )
      .leftJoin("product AS pd", "pdp.pdp_p_id", "pd.p_id")
      .leftJoin("p_damage AS pdm", "pdp.pdp_pd_id", "pdm.pd_id")
      .leftJoin("warehouse AS wh", "pdm.pd_w_id", "wh.w_id")
      .leftJoin("pdp_variants AS pda", "pdp.pdp_id", "pda.pdpa_pdp_id")
      .leftJoin("attribute_value AS av", "pda.pdpa_v_id", "av.av_id")
      .where("pdp.pdp_p_id", id);

    let data2: any = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;
      for (let j = 0; j < data2.length; j++) {
        if (data[i].p_id === data[j].p_id) {
          found = true;

          data2[j].pdp_variants.push({
            pdpa_id: data[i].pdpa_id,
            pdpa_v_id: data[i].pdpa_v_id,
            pdpa_quantity: data[i].pdpa_quantity,
            av_value: data[i].av_value,
          });
        }
      }
      if (!found) {
        data2.push({
          p_id: data[i].p_id,
          p_name: data[i].p_name,
          pdp_quantity: data[i].pdp_quantity,
          pd_id: data[i].pd_id,
          pd_w_id: data[i].pd_w_id,
          w_name: data[i].w_name,
          w_address: data[i].w_address,
          w_phone: data[i].w_phone,
          w_email: data[i].w_email,
          pd_details: data[i].pd_details,
          pd_date: data[i].pd_date,
          pd_created_by: data[i].pd_created_by,
          pd_created_at: data[i].pd_created_at,
          pdp_variants: [
            {
              pdpa_id: data[i].pdpa_id,
              pdpa_v_id: data[i].pdpa_v_id,
              pdpa_quantity: data[i].pdpa_quantity,
              av_value: data[i].av_value,
            },
          ],
        });
      }
    }

    if (data.length) {
      return {
        success: true,
        data: data2[0],
      };
    } else {
      return {
        success: false,
        message: "Damage product not found with this product id",
      };
    }
  }

  // update damage product
  public async updateDamageProductService(req: Request) {
    const { id } = req.params;
    const { pdp_product, pdp_variants } = req.body;
    const checkDamageProduct = await this.db("pd_product")
      .select("pdp_id")
      .where({ pdp_p_id: id });

    if (!checkDamageProduct.length) {
      return {
        success: false,
        message: "Damage product not found with this product id",
      };
    }

    return await this.db.transaction(async (trx) => {
      let res;

      if (pdp_product) {
        res = await trx("pd_product AS pdp")
          .join("p_damage AS pd", "pdp.pdp_pd_id", "pd.pd_id")
          .update(pdp_product)
          .where("pdp.pdp_id", pdp_product.pdp_id);
      }

      if (pdp_variants) {
        const { pdpa_id, ...restAtrb } = pdp_variants;
        res = await trx("pdp_variants AS pdpa")
          .update(restAtrb)
          .where("pdpa.pdpa_id", pdp_variants.pdpa_id);
      }

      if (res) {
        return {
          success: true,
          message: "Damage product update successfully",
        };
      } else {
        return {
          success: false,
          message: "Damage product cannot update at this moment",
        };
      }
    });
  }
}

export default AdminDamageProductService;
