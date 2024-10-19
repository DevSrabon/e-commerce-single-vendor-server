import { Request } from "express";
import { DATA_LIMIT, DATA_SKIP } from "../../../utils/miscellaneous/constants";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
import { IsaleInvoiceBody } from "../utils/types/combinedTypes";

class AdminSaleInvoiceService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create invoice service
  public async createSaleInvoiceService(req: Request) {
    return await this.db.transaction(async (trx) => {
      // const { au_id } = req.user;
      const {
        invoice_item,
        si_vat,
        si_service_charge,
        si_delivery_charge,
        si_discount,
        ...rest
      } = req.body as IsaleInvoiceBody;

      let si_sub_total: number = 0.0;

      const products = [];

      // validation
      for (const item of invoice_item) {
        if (item.sii_p_av_id) {
          const res = await trx("inventory AS i")
            .select(
              "i.i_id",
              "i.i_p_id",
              "p.p_name",
              "i.i_quantity_sold",
              "i.i_quantity_available",
              "ia.ia_id",
              "ia.i_av_id",
              "ia.ia_quantity_available"
            )
            .join("product AS p", "i.i_p_id", "p.p_id")
            .join("inventory_attribute AS ia", "i.i_id", "ia.ia_i_id")
            .andWhere("i.i_w_id", rest.si_w_id)
            .andWhere("i.i_p_id", item.sii_p_id)
            .andWhere("ia.i_av_id", item.sii_p_av_id)
            .andWhere("ia.ia_quantity_available", ">=", item.sii_quantity);

          if (!res.length) {
            await trx.rollback({
              success: false,
              message: `Sorry Product is out of stock in this warehouse.`,
            });
            return {
              success: false,
              message: `Sorry Product is out of stock in this warehouse.`,
            };
          }

          await trx("inventory")
            .update({
              i_quantity_available:
                res[0].i_quantity_available - item.sii_quantity,
              i_quantity_sold: res[0].i_quantity_sold + item.sii_quantity,
            })
            .where({ i_id: res[0].i_id });

          await trx("inventory_attribute")
            .update({
              ia_quantity_available:
                res[0].ia_quantity_available - item.sii_quantity,
            })
            .where({ i_id: res[0].i_id });

          products.push({
            sii_p_id: item.sii_p_id,
            sii_name: res[0].p_name,
            sii_p_av_id: item.sii_p_av_id,
            sii_unit_price: item.sii_unit_price,
            sii_quantity: item.sii_quantity,
            sii_total_price: item.sii_quantity * item.sii_unit_price,
          });

          si_sub_total += item.sii_unit_price * item.sii_quantity;
        } else {
          const res = await trx("inventory AS i")
            .select(
              "i.i_id",
              "i.i_p_id",
              "p.p_name",
              "i.i_quantity_available",
              "i.i_quantity_sold"
            )
            .join("product AS p", "i.i_p_id", "p.p_id")
            .andWhere("i.i_w_id", rest.si_w_id)
            .andWhere("i.i_p_id", item.sii_p_id)
            .andWhere("i.i_quantity_available", ">=", item.sii_quantity);

          if (!res.length) {
            await trx.rollback({
              success: false,
              message: `Sorry Product is out of stock in this warehouse.`,
            });
            return {
              success: false,
              message: `Sorry Product is out of stock in this warehouse.`,
            };
          }

          await trx("inventory")
            .update({
              i_quantity_available:
                res[0].i_quantity_available - item.sii_quantity,
              i_quantity_sold: res[0].i_quantity_sold + item.sii_quantity,
            })
            .where({ i_id: res[0].i_id });

          products.push({
            sii_p_id: item.sii_p_id,
            sii_name: res[0].p_name,
            sii_p_av_id: item.sii_p_av_id,
            sii_unit_price: item.sii_unit_price,
            sii_quantity: item.sii_quantity,
            sii_total_price: item.sii_quantity * item.sii_unit_price,
          });
          si_sub_total += item.sii_unit_price * item.sii_quantity;
        }
      }

      const si_grand_total =
        si_sub_total +
        si_service_charge +
        si_delivery_charge +
        si_vat -
        si_discount;

      const invoice = await trx("sale_invoice")
        .select("si_invoice_no")
        .limit(1)
        .orderBy("si_created_at", "desc");

      let serial_no = 1;

      if (invoice.length) {
        serial_no = Number(invoice[0].si_invoice_no.split("-")[1]) + 1;
      }

      const si_invoice_no = `STI-${serial_no}`;

      // inserted sale invoice
      const saleInvoiceRes = await trx("sale_invoice").insert({
        si_due: si_grand_total,
        si_invoice_no,
        si_sub_total,
        si_grand_total,
        si_vat,
        si_service_charge,
        si_delivery_charge,
        si_discount,
        // si_created_by_au_id: au_id,
        ...rest,
      });

      if (saleInvoiceRes.length) {
        // const modifiedIitem: IModifyInvoiceItem[] = [];
        // let productIDFromSaleProduct: number[] = [];

        const readyProduct = products.map((item) => {
          return {
            sii_si_id: saleInvoiceRes[0],
            ...item,
          };
        });

        // inserted sale invoice item
        await trx("si_item").insert(readyProduct);

        // if (saleInvItemRes.length) {
        //   // getting product from inventory which is selling
        //   const getSaleProductFmInventory: IgetSaleProduct[] | [] = await trx(
        //     'inventory'
        //   )
        //     .select('i_id', 'i_p_id', 'i_quantity_available')
        //     .andWhere('i_w_id', rest.si_w_id)
        //     .whereIn('i_p_id', productIDFromSaleProduct);

        //   // now decreasing product quantity from warehouse
        //   for (let i = 0; i < getSaleProductFmInventory.length; i++) {
        //     const saleItem = getSaleProductFmInventory[i];
        //     const removeItem = invoice_item.find(
        //       (item) => item.sii_p_id === saleItem.i_p_id
        //     );

        //     if (removeItem) {
        //       saleItem.i_quantity_available -= removeItem.sii_quantity;
        //     }
        //   }

        //   // update invenotory product quantity
        //   await Promise.all(
        //     getSaleProductFmInventory.map(async (p) => {
        //       await trx('inventory')
        //         .update({ i_quantity_available: p.i_quantity_available })
        //         .andWhere({ i_id: p.i_id });
        //     })
        //   );

        //   // step:2
        //   // getting product attribute from inventory attribute
        //   const getInventoryAtbbBySaleProduct: IgetSaleProductInventoryAtbb[] =
        //     await trx('inventory AS i')
        //       .select(
        //         'i.i_id',
        //         'i.i_p_id',
        //         'ia.ia_id',
        //         'ia.i_av_id',
        //         'ia.ia_quantity_available'
        //       )
        //       .join('inventory_attribute AS ia', 'i.i_id', 'ia.ia_i_id')
        //       .andWhere('i.i_w_id', rest.si_w_id)
        //       .whereIn('i.i_p_id', productIDFromSaleProduct);

        //   console.log({ getInventoryAtbbBySaleProduct });

        //   if (getInventoryAtbbBySaleProduct.length) {
        //     const modifiedInventoryAttb: any[] = [];

        //     // updating attribute quantity which product transfer to inventory
        //     for (let i = 0; i < getInventoryAtbbBySaleProduct.length; i++) {
        //       const saleItem = getInventoryAtbbBySaleProduct[i];
        //       const removeItem = invoice_item.find(
        //         (item) =>
        //           item.sii_p_id === saleItem.i_p_id &&
        //           item.sii_p_av_id === saleItem.i_av_id
        //       );

        //       if (removeItem) {
        //         modifiedInventoryAttb.push({
        //           i_id: saleItem.i_id,
        //           i_p_id: saleItem.i_p_id,
        //           ia_id: saleItem.ia_id,
        //           i_av_id: saleItem.i_av_id,
        //           ia_quantity_available:
        //             saleItem.ia_quantity_available - removeItem.sii_quantity,
        //         });
        //       }
        //     }

        //     // inserted update product attribute quantity in inventory attribute
        //     await Promise.all(
        //       modifiedInventoryAttb.map(
        //         async (atb: IgetSaleProductInventoryAtbb) => {
        //           await trx('inventory_attribute')
        //             .update({
        //               ia_quantity_available: atb.ia_quantity_available,
        //             })
        //             .andWhere({ ia_id: atb.ia_id });
        //         }
        //       )
        //     );
        //   }
        // }

        return {
          data: {
            si_id: saleInvoiceRes[0],
          },
          success: true,
          message: "Sale invoice created successfully",
        };
      } else {
        return {
          success: false,
          message: "Something went wrong!",
        };
      }
    });
  }

  // get invoice service
  public async getSaleInvoiceService(req: Request) {
    const { limit, skip, filter, type } = req.query as {
      limit: string;
      skip: string;
      filter: string;
      type: string;
    };

    const data = await this.db("sale_invoice AS si")
      .select(
        "si.si_id",
        "si.si_invoice_no",
        "si.si_sale_date",
        "si.si_grand_total",
        "si.si_due",
        "si.si_type",
        "w.w_name",
        "cl.cl_name",
        "ecl.ec_name",
        "st.st_name"
      )
      .leftJoin("client AS cl", "si.si_cl_id", "cl.cl_id")
      .leftJoin("e_customer AS ecl", "si.si_e_cl_id", "ecl.ec_id")
      .leftJoin("warehouse AS w", "si.si_w_id", "w.w_id")
      .leftJoin("staff AS st", "si.si_sale_by_st_id", "st.st_id")
      .where((qb) => {
        if (filter) {
          qb.orWhere("si.si_invoice_no", filter.toUpperCase());
          qb.orWhereILike("cl.cl_name", `%${filter}%`);
        }
        if (type) {
          qb.andWhere("si.si_type", type);
        }
      })
      .orderBy("si.si_sale_date", "desc")
      .limit(limit ? Number(limit) : DATA_LIMIT)
      .offset(skip ? Number(skip) : DATA_SKIP);

    const total = await this.db("sale_invoice AS si")
      .count("si.si_id AS total")
      .leftJoin("client AS cl", "si.si_cl_id", "cl.cl_id")
      .leftJoin("warehouse AS w", "si.si_w_id", "w.w_id")
      .leftJoin("staff AS st", "si.si_sale_by_st_id", "st.st_id")
      .where((qb) => {
        if (filter) {
          qb.orWhere("si.si_invoice_no", filter.toUpperCase());
          qb.orWhereILike("cl.cl_name", `%${filter}%`);
        }

        if (type) {
          qb.andWhere("si.si_type", type);
        }
      });

    return {
      success: true,
      data,
      total: total[0].total,
    };
  }

  // get single invoice
  public async getSingleInvoiceService(req: Request) {
    const { id } = req.params;

    const data = await this.db("sale_invoice AS si")
      .select(
        "si.si_id",
        "si.si_invoice_no",
        "si.si_sale_date",
        "si.si_vat",
        "si.si_service_charge",
        "si.si_delivery_charge",
        "si.si_discount",
        "si.si_sub_total",
        "si.si_grand_total",
        "si.si_due",
        "si.si_type",
        "si.si_remark",
        "w.w_name",
        "cl.cl_name",
        "ecl.ec_name",
        "st.st_name"
      )
      .leftJoin("client AS cl", "si.si_cl_id", "cl.cl_id")
      .leftJoin("e_customer AS ecl", "si.si_e_cl_id", "ecl.ec_id")
      .leftJoin("warehouse AS w", "si.si_w_id", "w.w_id")
      .leftJoin("staff AS st", "si.si_sale_by_st_id", "st.st_id")
      .where("si.si_id", id);

    const invoiceItems = await this.db("si_item")
      .select(
        "sii_p_id",
        "sii_name",
        "sii_unit_price",
        "sii_quantity",
        "sii_total_price"
      )
      .where("sii_si_id", id);

    if (!data.length) {
      return {
        success: false,
        message: "Invoice not found!",
      };
    }

    return {
      success: true,
      data: {
        ...data[0],
        items: invoiceItems,
      },
    };
  }

  // get all product of inventory for create invoice
  public async getSingleInventoryService(req: Request) {
    const { id } = req.params;

    const data = await this.db("inventory_view AS iv")
      .select(
        "w.w_id",
        "w.w_name",
        "pv.p_id",
        "pv.p_name",
        "pv.p_slug",
        "pv.p_unit",
        "pv.p_tags",
        "pv.p_details_en",
        "pv.p_details_ar",
        "pv.p_status",
        "pv.s_id",
        "pv.s_name",
        "pv.s_image",
        "iv.i_quantity_available",
        "pv.categories",
        "pv.p_images",
        "pv.p_attribute",
        "inventory_attribute"
      )
      .leftJoin("product_view AS pv", "iv.i_p_id", "pv.p_id")
      .leftJoin("warehouse AS w", "iv.i_w_id", "w.w_id")
      .where("iv.i_id", id);

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: "Cannot found single inventory product with this id",
      };
    }
  }

  // update invoice remark
  public async updateSaleInvoiceRemark(req: Request) {
    const { remark } = req.body;
    const { id } = req.params;

    await this.db("sale_invoice")
      .update({ si_remark: remark })
      .where({ si_id: id });

    return {
      success: true,
      message: "Remark updated successful",
    };
  }
}

export default AdminSaleInvoiceService;
