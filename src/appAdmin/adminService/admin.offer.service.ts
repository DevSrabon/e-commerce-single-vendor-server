import { Request } from "express";
import CommonService from "../../common/commonService/common.service";
import Lib from "../../utils/lib/lib";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
interface IOfferProducts {
  p_id: number;
  op_discount: number;
  op_discount_type: "fixed" | "percentage";
  id?: number;
}
class AdminOfferService extends AdminAbstractServices {
  constructor() {
    super();
  }
  public async createOffer(req: Request) {
    const { au_id } = req.user;
    const { product_ids, offer_name_en, offer_name_ar, ...rest } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];
    const productIds: IOfferProducts[] = product_ids
      ? JSON.parse(product_ids)
      : [];
    if (!files.length) {
      return {
        success: false,
        message: "You must provide product image",
      };
    }
    const checkOffer = await this.db("offers")
      .select("id")
      .where({ offer_name_en })
      .orWhere({ offer_name_ar });
    if (checkOffer.length) {
      return {
        success: false,
        message: "offer name already exits",
      };
    }
    return await this.db.transaction(async (trx) => {
      const offer_slug = Lib.stringToSlug(offer_name_en);
      rest.offer_image = files[0].filename;
      const insertOffer = await trx("offers").insert({
        offer_name_en,
        offer_name_ar,
        offer_slug,
        ...rest,
      });

      if (productIds.length && insertOffer.length) {
        const checkProducts = await trx("product")
          .select("p_id")
          .whereIn(
            "p_id",
            productIds.map((pId) => pId.p_id)
          );
        if (productIds.length !== checkProducts.length) {
          return {
            success: false,
            message: "Products doesn't exists!",
          };
        }
        const offerProductsPayload = productIds.map((pId) => {
          return {
            offer_id: insertOffer,
            ...pId,
          };
        });
        await trx("offer_products").insert(offerProductsPayload);
      }
      if (insertOffer.length) {
        await new CommonService().createAuditTrailService({
          at_admin_id: au_id,
          at_details: `An offer has been created, ${offer_name_en}`,
        });
        return {
          success: true,
          message: "Offer has been created successfully!",
        };
      } else {
        return {
          success: false,
          message: "Offer creation has been failed!",
        };
      }
    });
  }

  public async getAll(req: Request) {
    const {
      skip = 0,
      limit = 100,
      sort = "created_at",
      order = "desc",
    } = req.query;

    const offers = await this.db("offers")
      .select("*")
      .orderBy(sort as string, order as string)
      .offset(Number(skip))
      .limit(Number(limit));

    const totalOffers = await this.db("offers").count({ total: "*" }).first();

    return {
      success: true,
      data: offers,
      total: totalOffers?.total || 0,
    };
  }

  public async getSingle(req: Request) {
    const { id } = req.params;

    const offer = await this.db("offers").where({ id }).first();

    if (!offer) {
      return {
        success: false,
        message: "Offer not found",
      };
    }

    const offerProducts = await this.db("offer_products as opd")
      .select("*")
      .join("product_view as p", "opd.p_id", "=", "p.p_id")
      .where("opd.offer_id", id);

    return {
      success: true,
      data: {
        ...offer,
        products: offerProducts,
      },
    };
  }

  public async updateSingle(req: Request) {
    const { id: offer_id } = req.params;
    const {
      offer_name_en,
      offer_name_ar,
      addProductIds,
      editProductIds,
      deleteProductIds,
      ...rest
    } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];
    const parsedAddProductIds: IOfferProducts[] = addProductIds
      ? JSON.parse(addProductIds)
      : [];
    const parsedDeleteProductIds: number[] = deleteProductIds
      ? JSON.parse(deleteProductIds)
      : [];
    const parsedEditProductIds: IOfferProducts[] = editProductIds
      ? JSON.parse(editProductIds)
      : [];
    const existingOffer = await this.db("offers").where({ offer_id }).first();

    if (!existingOffer) {
      return {
        success: false,
        message: "Offer not found",
      };
    }

    // Check for duplicate offer names
    const checkOffer = await this.db("offers")
      .select("id")
      .where(function () {
        this.where({ offer_name_en }).orWhere({ offer_name_ar });
      })
      .andWhereNot({ offer_id });

    if (checkOffer.length) {
      return {
        success: false,
        message: "Offer name already exists",
      };
    }

    const offer_slug = Lib.stringToSlug(offer_name_en);
    rest.offer_image = files.length
      ? files[0].filename
      : existingOffer.offer_image;

    return await this.db.transaction(async (trx) => {
      await trx("offers")
        .where({ offer_id })
        .update({
          offer_name_en,
          offer_name_ar,
          offer_slug,
          ...rest,
        });

      if (parsedAddProductIds.length) {
        const checkProducts = await trx("product")
          .select("p_id")
          .whereIn(
            "p_id",
            parsedAddProductIds.map((pId) => pId.p_id)
          );
        if (parsedAddProductIds.length !== checkProducts.length) {
          return {
            success: false,
            message: "Some products don't exist!",
          };
        }

        // Insert new products into the offer
        const offerProductsPayload = parsedAddProductIds.map((pId) => {
          return { offer_id, p_id: pId };
        });
        await trx("offer_products").insert(offerProductsPayload);
      }

      if (parsedDeleteProductIds.length) {
        await trx("offer_products")
          .whereIn("p_id", parsedDeleteProductIds)
          .delete();
      }

      if (parsedEditProductIds.length) {
        const checkProducts = await trx("product")
          .select("p_id")
          .whereIn(
            "p_id",
            parsedEditProductIds.map((pId) => pId.p_id)
          );
        if (parsedEditProductIds.length !== checkProducts.length) {
          return {
            success: false,
            message: "Some products don't exist!",
          };
        }

        // Update products in the offer
        for (const pId of parsedEditProductIds) {
          const getOfferProduct = await trx("offer_products")
            .select("*")
            .where({
              id: pId.id,
              p_id: pId.p_id,
              offer_id,
            });

          if (!getOfferProduct.length) {
            throw new Error("Offer product doesn't exists!");
          }
          await trx("offer_products")
            .where({ p_id: pId.p_id, offer_id, id: pId.id })
            .update({
              op_discount: pId.op_discount ?? getOfferProduct[0].op_discount,
              op_discount_type:
                pId.op_discount_type ?? getOfferProduct[0].op_discount_type,
            });
        }
      }

      await new CommonService().createAuditTrailService({
        at_admin_id: req.user.au_id,
        at_details: `Offer has been updated: ${offer_name_en}, updated data:${JSON.stringify(
          req.body
        )}`,
      });

      return {
        success: true,
        message: "Offer updated successfully",
      };
    });
  }

  public async delete(req: Request) {
    const { id: offer_id } = req.params;

    const existingOffer = await this.db("offers").where({ offer_id }).first();

    if (!existingOffer) {
      return {
        success: false,
        message: "Offer not found",
      };
    }

    return await this.db.transaction(async (trx) => {
      await trx("offer_products").where({ offer_id }).delete();
      await trx("offers").where({ offer_id }).delete();

      await new CommonService().createAuditTrailService({
        at_admin_id: req.user.au_id,
        at_details: `Offer has been deleted: ${existingOffer.offer_name_en}`,
      });

      return {
        success: true,
        message: "Offer deleted successfully",
      };
    });
  }
}

export default AdminOfferService;
