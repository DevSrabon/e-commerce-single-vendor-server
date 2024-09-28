import { Request } from "express";
import Lib from "../../utils/lib/lib";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
interface IProductVariants {
  id: number;
  price: number;
}
class AdminProductService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create a product service
  public async createProduct(req: Request) {
    const {
      w_id,
      store_id,
      p_name,
      p_tags,
      p_details,
      category,
      colors: c,
      sizes: s,
      variants: v,
      p_unit,
    } = req.body;
    const variants = JSON.parse(v);
    const colors = JSON.parse(c);
    const sizes = JSON.parse(s);

    const checkProduct = await this.db("product")
      .select("p_name")
      .where({ p_name });

    if (checkProduct.length) {
      return {
        success: false,
        message: "Product name already exists",
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (!files.length) {
      return {
        success: false,
        message: "You must provide product image",
      };
    }

    return await this.db.transaction(async (trx) => {
      const checkWarehouse = await trx("location")
        .select("w_id")
        .where({
          w_id,
        })
        .andWhere("type", "Warehouse");
      if (!checkWarehouse.length) {
        return {
          success: false,
          message: "No warehouse found",
        };
      }

      const checkStore = await trx("location")
        .select("w_id")
        .where({
          w_id: store_id,
        })
        .andWhere("type", "Store");
      if (!checkStore.length) {
        return {
          success: false,
          message: "No store found",
        };
      }
      const p_slug = Lib.stringToSlug(p_name);

      // Insert product
      const productRes = await trx("product").insert({
        w_id,
        store_id,
        p_name,
        p_slug,
        p_tags,
        p_details,
        p_unit,
        is_featured: 0,
      });

      const productId = productRes[0];

      // Handle category insertion
      const parseCategory = JSON.parse(category);
      const categoryArray = await Promise.all(
        parseCategory.map(async (cateId: number) => {
          const checkCategory = await trx("category")
            .select("cate_id")
            .where({ cate_id: cateId });
          if (!checkCategory.length) {
            throw new Error("Invalid category id");
          }
          return {
            pc_p_id: productId,
            pc_cate_id: cateId,
          };
        })
      );
      if (categoryArray.length) {
        await trx("product_category").insert(categoryArray);
      }

      // Handle image insertions
      const productImgArray = files
        .filter((file) => file.fieldname === "productImages")
        .map((file) => ({
          pi_p_id: productId,
          pi_image: file.filename,
        }));

      const colorImgArray = await Promise.all(
        colors.map(async (colorId: number, colorIndex: number) => {
          const checkColor = await trx("color")
            .select("id")
            .where({ id: colorId });
          if (!checkColor.length) {
            throw new Error("Invalid color id");
          }

          const colorPhotos = files.filter(
            (file) => file.fieldname === `colorsPhotos_${colorIndex + 1}`
          );
          return colorPhotos.map((photo) => ({
            p_id: productId,
            color_id: colorId,
            image: photo.filename,
          }));
        })
      );

      // Flatten color images array before insertion
      const flattenedColorImgArray = colorImgArray.flat();
      if (flattenedColorImgArray.length) {
        await trx("color_image").insert(flattenedColorImgArray);
      }

      // Handle size insertion
      const sizeInsertedData = await Promise.all(
        sizes.map(async (sizeId: number) => {
          const checkSize = await trx("size")
            .select("id")
            .where({ id: sizeId });
          if (!checkSize.length) {
            throw new Error("Invalid size id");
          }
          return {
            p_id: productId,
            size_id: sizeId,
          };
        })
      );
      if (sizeInsertedData.length) {
        await trx("p_size").insert(sizeInsertedData);
      }

      // Insert product images
      if (productImgArray.length) {
        await trx("product_image").insert(productImgArray);
      }

      // Insert inventory
      await trx("inventory").insert({
        i_w_id: w_id,
        i_p_id: productId,
        i_quantity_available: p_unit,
      });

      // Insert variants
      const variantInsertedData = await Promise.all(
        variants.map(async (el: IProductVariants) => {
          if (el.price < 0) {
            throw new Error("Invalid variant price");
          }
          const checkVariant = await trx("fabric")
            .select("id")
            .where({ id: el.id });
          if (!checkVariant.length) {
            throw new Error("Invalid fabric id");
          }
          return {
            p_id: productId,
            fabric_id: el.id,
            price: el.price,
          };
        })
      );
      if (variantInsertedData.length) {
        await trx("variant_product").insert(variantInsertedData);
      }
      const { barcodeFilePath, qrCodeFilePath, sku } =
        await new Lib().generateProductAssets(
          p_slug,
          parseCategory.join(),
          productId
        );
      await trx("product")
        .update({
          sku,
          barcode: barcodeFilePath,
          qr_code: qrCodeFilePath,
        })
        .where({ p_id: productId });

      return {
        success: true,
        message: "Product created successfully",
      };
    });
  }

  // public async createProduct(req: Request) {
  //   const {
  //     p_s_id,
  //     p_name,
  //     p_tags,
  //     p_details,
  //     category,
  //     colors,
  //     colorsPhoto,
  //     sizes,
  //     variants: v,
  //     attribute_value,
  //     p_organic,
  //     p_unit,
  //   } = req.body;
  //   const variants = JSON.parse(v);
  //   const checkProduct = await this.db("product")
  //     .select("p_name")
  //     .where({ p_name });

  //   if (checkProduct.length) {
  //     return {
  //       success: false,
  //       message: "Product name already exist",
  //     };
  //   }

  //   const files = (req.files as Express.Multer.File[]) || [];

  //   if (!files.length) {
  //     return {
  //       success: false,
  //       message: "You must provide product image",
  //     };
  //   }

  //   return await this.db.transaction(async (trx) => {
  //     const p_slug = Lib.stringToSlug(p_name);

  //     const productRes = await trx("product").insert({
  //       p_s_id,
  //       p_name,
  //       p_slug,
  //       p_tags,
  //       p_details,
  //       p_unit,
  //       p_organic,
  //     });

  //     let categoryArray: Object[] = [];
  //     const parseCategory = JSON.parse(category);

  //     parseCategory.forEach((el: number) => {
  //       categoryArray.push({
  //         pc_p_id: productRes[0],
  //         pc_cate_id: el,
  //       });
  //     });
  //     await trx("product_category").insert(categoryArray);

  //     if (attribute_value !== "undefined") {
  //       let AvArray: Object[] = [];
  //       const parseAv = JSON.parse(attribute_value);

  //       parseAv.forEach((el: number) => {
  //         AvArray.push({
  //           pa_p_id: productRes[0],
  //           pa_av_id: el,
  //         });
  //       });

  //       await trx("product_attribute").insert(AvArray);
  //     }

  //     let imgArray: Object[] = [];

  //     files.forEach((el: any) => {
  //       imgArray.push({
  //         pi_p_id: productRes[0],
  //         pi_image: el.filename,
  //       });
  //     });

  //     const pImageRes = await trx("product_image").insert(imgArray);

  //     if (pImageRes.length) {
  //       return {
  //         success: true,
  //         message: "Successfully product created",
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         message: "Cannot product create at this moment",
  //       };
  //     }
  //   });
  // }

  // get all product by status and categroy
  public async getAllProduct(req: Request) {
    const {
      status,
      cate_id,
      from_date,
      to_date,
      p_name,
      limit,
      skip,
      order_by = "p_id",
      according_order = "asc",
    } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);
    const dtbs = this.db("product_view");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select("p_id", "p_name", "p_status", "categories")
      .where(function () {
        if (status) {
          this.andWhere("p_status", status);
        }

        if (cate_id) {
          this.andWhereRaw("JSON_CONTAINS(categories, ?)", [
            `{"cate_id":${cate_id}}`,
          ]);
        }

        if (p_name) {
          this.andWhere("p_name", "like", `%${p_name}%`);
        }

        if (from_date && to_date) {
          this.whereBetween("p_created_at", [from_date as string, endDate]);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = await this.db("product_view")
      .count("p_id AS total")
      .where(function () {
        if (status) {
          this.andWhere("p_status", status);
        }
        if (cate_id) {
          this.andWhereRaw("JSON_CONTAINS(categories, ?)", [
            `{"cate_id":${cate_id}}`,
          ]);
        }
        if (p_name) {
          this.andWhere("p_name", "like", `%${p_name}%`);
        }
        if (from_date && to_date) {
          this.whereBetween("p_created_at", [from_date as string, endDate]);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  // get all product by supplier
  public async getAllProductBySupplier(req: Request) {
    const { supplierId } = req.params;

    const dtbs = this.db("product_view");
    const data = await dtbs
      .select("p_id", "p_name")
      .andWhere("p_status", 1)
      .andWhere("s_id", supplierId);

    return {
      success: true,
      data,
    };
  }

  // get all product which is not include in ecommerce
  public async getProductNotInEcommerceProduct(req: Request) {
    const eProduct = await this.db("e_product").select("ep_p_id");
    const ids = eProduct.map((item) => item.ep_p_id);

    const data = await this.db("product_view AS pv")
      .select("pv.p_id", "pv.p_name", "pv.available_stock")
      .andWhere("pv.p_status", 1)
      .whereNotIn("pv.p_Id", ids);

    return {
      success: true,
      data,
    };
  }

  // get attributes by product
  public async getAttributesByProduct(req: Request) {
    const { productId } = req.params;
    const data = await this.db("product_view")
      .select("p_attribute")
      .where("p_id", productId);

    return {
      success: true,
      data: data[0],
    };
  }

  // get single product
  public async getSingleProduct(req: Request) {
    const { id } = req.params;

    const data = await this.db("product_view")
      .select(
        // "p_id",
        // "p_name",
        // "p_slug",
        // "p_unit",
        // "p_tags",
        // "p_details",
        // "p_status",
        // "p_created_at",
        // "available_stock",
        // // "p_organic",
        // // "p_attribute",
        // "categories",
        // "p_images"
        "*"
      )
      .where("p_id", id)
      .first();

    if (!data) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    // let pAttb = data[0]?.p_attribute;
    // let pAttb2: any = [];

    // for (let i = 0; i < pAttb?.length; i++) {
    //   let found = false;
    //   for (let j = 0; j < pAttb2.length; j++) {
    //     if (pAttb2[j].a_name === pAttb[i].a_name) {
    //       found = true;
    //       pAttb2[j].ab_values.push({
    //         av_id: pAttb[i].av_id,
    //         av_value: pAttb[i].av_value,
    //       });
    //     }
    //   }
    //   if (!found) {
    //     pAttb2.push({
    //       a_name: pAttb[i].a_name,
    //       ab_values: [
    //         {
    //           av_id: pAttb[i].av_id,
    //           av_value: pAttb[i].av_value,
    //         },
    //       ],
    //     });
    //   }
    // }
    console.log(data);

    const { categories, p_images, ...rest } = data;

    console.log({ categories });

    return {
      success: true,
      data: { ...rest, categories, p_images },
    };
  }

  // update a product service
  public async updateProduct(req: Request) {
    const { id } = req.params;
    const {
      added_category,
      removed_category,
      added_av,
      removed_av,
      removed_image,
      ...rest
    } = req.body;

    const addedCategory: number[] = added_category
      ? JSON.parse(added_category)
      : [];
    const removedCategory: number[] = removed_category
      ? JSON.parse(removed_category)
      : [];
    const addedAv: number[] = added_av ? JSON.parse(added_av) : [];
    const removedAV: number[] = removed_av ? JSON.parse(removed_av) : [];
    const removedImage: { image_id: number; image_name: string }[] =
      removed_image ? JSON.parse(removed_image) : [];

    console.log(req.body, "request body");

    const checkProduct = await this.db("product")
      .select("p_name")
      .where({ p_id: id });

    if (!checkProduct.length) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    return await this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      const newImage: { pi_image: string; pi_p_id: number | string }[] = [];

      files.forEach((item) => {
        newImage.push({ pi_image: item.filename, pi_p_id: id });
      });

      if (removedCategory.length) {
        await trx("product_category")
          .whereIn("pc_cate_id", removedCategory)
          .andWhere("pc_p_id", id)
          .delete();
      }

      if (addedCategory.length) {
        await trx("product_category").insert(
          addedCategory.map((item: number) => {
            return { pc_p_id: id, pc_cate_id: item };
          })
        );
      }

      if (removedAV.length) {
        await trx("product_attribute")
          .whereIn("pa_av_id", removedAV)
          .andWhere("pa_p_id", id)
          .delete();
      }

      if (addedAv.length) {
        await trx("product_attribute").insert(
          addedAv.map((item: number) => {
            return { pa_p_id: id, pa_av_id: item };
          })
        );
      }

      const removedImageName: { filename: string; folder: string }[] = [];
      if (removedImage.length) {
        const ids: number[] = [];
        removedImage.forEach((item) => {
          ids.push(item.image_id);
          removedImageName.push({
            filename: item.image_name,
            folder: "product_files",
          });
        });
        console.log({ ids });
        await trx("product_image").whereIn("pi_id", ids).delete();
      }

      if (newImage.length) {
        await trx("product_image").insert(newImage);
      }

      // console.log({ rest });

      if (Object.keys(rest).length !== 0) {
        await trx("product").update(rest).where("p_id", id);
      }

      if (removedImage) {
        await this.manageFile.deleteFromStorage(removedImageName);
      }

      return {
        success: true,
        data: {
          images: newImage,
        },
        message: "Product udpated!",
      };
    });
  }

  // create a product category
  public async createCategory(req: Request) {
    const { cate_name_en, cate_name_bn, cate_parent_id } = req.body;

    const check = await this.db("category")
      .select("cate_id")
      .where({ cate_name_en });

    if (check.length) {
      return {
        success: false,
        message: "Category name already exist",
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (!files.length) {
      return {
        success: false,
        message: "You must provide category image",
      };
    }

    const res = await this.db("category").insert({
      cate_name_en,
      cate_parent_id,
      cate_name_bn,
      cate_slug: Lib.stringToSlug(cate_name_en),
      cate_image: files[0].filename,
    });

    if (res.length) {
      return {
        success: true,
        data: {
          cate_id: res[0],
          cate_name_en,
          cate_parent_id,
          cate_name_bn,
          cate_slug: Lib.stringToSlug(cate_name_en),
          cate_image: files[0].filename,
        },
        message: "Category has been created",
      };
    } else {
      return {
        success: false,
        message: "Cannot create category",
      };
    }
  }

  // get product category service
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
        "cate_name_bn",
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
      cate_name_bn: item.cate_name_bn,
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

  // update product category service
  public async updateCategory(req: Request) {
    const { id } = req.params;
    const checkCate = await this.db("category")
      .select("cate_image")
      .where("cate_id", id);

    if (!checkCate.length) {
      return {
        success: false,
        message: "No category found with this id",
      };
    }

    const { cate_name_en, ...rest } = req.body;

    if (cate_name_en) {
      const checkName = await this.db("category")
        .select("cate_id")
        .where("cate_name_en", cate_name_en);

      if (checkName.length) {
        return {
          success: false,
          message: "Category name already exist",
        };
      }
      rest.cate_name_en = cate_name_en;
      rest.cate_slug = Lib.stringToSlug(cate_name_en);
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) {
      rest.cate_image = files[0].filename;
    }

    const res = await this.db("category").update(rest).where("cate_id", id);
    if (res) {
      if (files.length && checkCate[0].cate_image) {
        await this.manageFile.deleteFromStorage([
          { filename: checkCate[0].cate_image, folder: "product_category" },
        ]);
      }

      return {
        success: true,
        data: {
          cate_image: rest.cate_image,
          cate_slug: rest.cate_slug,
        },
        message: "Category updated successfully",
      };
    } else {
      return {
        success: false,
        message: "Cannot update category now",
      };
    }
  }
}

export default AdminProductService;
