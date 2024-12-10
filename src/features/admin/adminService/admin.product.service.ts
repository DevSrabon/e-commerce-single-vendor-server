import { Request } from "express";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
interface IProductVariants {
  id: number;
  fabric_id: number;
  price: number;
  discount: number;
  discount_type: "fixed" | "percentage";
  is_default?: boolean;
}
interface IColor {
  id: number;
  code: string;
  color: string;
  details: string;
  is_active?: boolean;
}

interface ISize {
  id: number;
  size: string;
  height: string;
  weight: string;
  details?: string;
  is_active?: boolean;
}

interface IFabric {
  id: number;
  name: string;
  details?: string;
  is_active?: boolean;
}

class AdminProductService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create a product service
  public async createProduct(req: Request) {
    const {
      w_id,
      p_name_en,
      p_name_ar,
      p_tags,
      p_details_en,
      p_details_ar,
      category,
      colors,
      sizes,
      quantity,
      stock_alert,
      is_featured = 0,
      variants,
    } = req.body;

    const parsedVariants = variants ? JSON.parse(variants) : [];
    const parsedColor = colors ? JSON.parse(colors) : [];
    const parsedSizes = sizes ? JSON.parse(sizes) : [];

    if (!parsedColor.length || !parsedSizes.length || !parsedVariants.length) {
      return {
        success: false,
        message: "Please provide color, sizes and variants",
      };
    }

    const checkProduct = await this.db("product")
      .select("p_name_en", "p_name_ar")
      .where({ p_name_en })
      .orWhere({ p_name_ar });

    if (checkProduct.length) {
      return {
        success: false,
        message: "Product name in English or Arabic already exists",
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
      const checkWarehouse = await trx("warehouse").select("w_id").where({
        w_id,
      });

      if (!checkWarehouse.length) {
        return {
          success: false,
          message: "No store found",
        };
      }

      let p_slug = Lib.stringToSlug(p_name_en);

      const checkSlug = await trx("product").select("p_slug").where({
        p_slug,
      });
      if (checkSlug.length) {
        return {
          success: false,
          message: "Product slug already exists",
        };
      }

      // Insert product
      const productRes = await trx("product").insert({
        w_id,
        p_name_en,
        p_name_ar,
        p_slug,
        p_tags,
        p_details_en,
        p_details_ar,
        stock_alert,
        is_featured,
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

      const colorsArray = await Promise.all(
        parsedColor.map(async (colorId: number, colorIndex: number) => {
          const checkColor = await trx("color")
            .select("id")
            .where({ id: colorId });
          if (!checkColor.length) {
            throw new Error("Invalid color id");
          }

          return {
            p_id: productId,
            color_id: colorId,
          };
        })
      );

      if (colorsArray.length) {
        // Insert the colors and get the first inserted ID
        const [pColor] = await trx("p_color").insert(colorsArray);

        if (!pColor) {
          return {
            success: false,
            message: "Color not inserted",
          };
        }

        // Insert color images
        const insertColorImg = await Promise.all(
          parsedColor.map(async (colorId: number, colorIndex: number) => {
            const checkColor = await trx("color")
              .select("id")
              .where({ id: colorId });

            if (!checkColor.length) {
              throw new Error("Invalid color id");
            }

            const colorImages: any[] = [];
            files.forEach((file) => {
              if (file.fieldname === `colorsPhotos_${colorIndex + 1}`) {
                colorImages.push({
                  p_id: productId,
                  p_color_id: pColor + colorIndex,
                  image: file.filename,
                });
              }
            });

            return colorImages;
          })
        );

        const flattenedInsertColorImg = insertColorImg.flat();

        if (!flattenedInsertColorImg.length) {
          throw new CustomError(
            "Color image not inserted",
            400,
            "Internal server Error"
          );
        }

        await trx("color_image").insert(flattenedInsertColorImg);
      }

      // Handle size insertion
      const sizeInsertedData = await Promise.all(
        parsedSizes.map(async (sizeId: number) => {
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
        i_quantity_available: quantity,
      });

      // Insert parsedVariants
      const variantInsertedData = await Promise.all(
        parsedVariants.map(async (el: IProductVariants) => {
          if (el.price < 0) {
            throw new Error("Invalid variant price");
          }
          const checkVariant = await trx("fabric")
            .select("id")
            .where({ id: el.id });
          if (!checkVariant.length) {
            throw new Error("Invalid fabric id");
          }
          if (el.discount_type === "percentage") {
            if (
              Number(el.price) <=
              Number(el.price) - (Number(el.discount) * Number(el.price)) / 100
            ) {
              throw new CustomError(
                "Discount price is greater than product price!",
                412,
                "Unprocessable Entity"
              );
            }
          } else {
            if (Number(el.price) <= Number(el.price) - Number(el.discount)) {
              throw new CustomError(
                "Discount price is greater than product price!",
                412,
                "Unprocessable Entity"
              );
            }
          }
          return {
            p_id: productId,
            fabric_id: el.id,
            price: el.price,
            discount: el.discount,
            discount_type: el.discount_type,
          };
        })
      );
      if (variantInsertedData.length) {
        await trx("variant_product").insert(variantInsertedData);
      }

      const barcode = new Lib().generateBarCode(productId);
      const sku = new Lib().generateSKU(productId, p_name_en);
      await trx("product")
        .update({
          sku,
          barcode,
        })
        .where({ p_id: productId });

      return {
        success: true,
        message: "Product created successfully",
        data: {
          id: productId,
        },
      };
    });
  }

  public async getAllProduct(req: Request) {
    const {
      status,
      cate_id,
      from_date,
      to_date,
      p_name_en,
      p_name_ar,
      limit,
      skip,
      order_by = "p_created_at",
      according_order = "dec",
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
      .select(
        "p_id",
        "p_name_en",
        "p_name_ar",
        "p_status",
        "categories",
        "p_images",
        "is_featured"
      )
      .where(function () {
        if (status) {
          this.andWhere("p_status", status);
        }

        if (cate_id) {
          this.andWhereRaw("JSON_CONTAINS(categories, ?)", [
            `{"cate_id":${cate_id}}`,
          ]);
        }

        if (p_name_en) {
          this.andWhere("p_name_en", "like", `%${p_name_en}%`);
        }
        if (p_name_ar) {
          this.andWhere("p_name_ar", "like", `%${p_name_ar}%`);
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
        if (p_name_en) {
          this.andWhere("p_name_en", "like", `%${p_name_en}%`);
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

  // update a product service
  public async updateProduct(req: Request) {
    const { id } = req.params;
    const {
      added_category,
      removed_category,
      removed_image,
      added_variants,
      edit_variants,
      removed_variants,
      added_colors,
      removed_colors,
      added_sizes,
      removed_sizes,
      remove_color_photos,
      quantity,
      ...rest
    } = req.body;

    const addedCategory: number[] = added_category
      ? JSON.parse(added_category)
      : [];
    const removedCategory: number[] = removed_category
      ? JSON.parse(removed_category)
      : [];
    const addedVariants: IProductVariants[] = added_variants
      ? JSON.parse(added_variants)
      : [];
    const removeVariants: number[] = removed_variants
      ? JSON.parse(removed_variants)
      : [];
    const removedImage: number[] = removed_image
      ? JSON.parse(removed_image)
      : [];

    const editVariants: IProductVariants[] = edit_variants
      ? JSON.parse(edit_variants)
      : [];

    const addedColors: number[] = added_colors ? JSON.parse(added_colors) : [];
    const removedColorPhotos: number[] = remove_color_photos
      ? JSON.parse(remove_color_photos)
      : [];
    const removedColors: number[] = removed_colors
      ? JSON.parse(removed_colors)
      : [];
    const addedSizes: number[] = added_sizes ? JSON.parse(added_sizes) : [];
    const removedSizes: number[] = removed_sizes
      ? JSON.parse(removed_sizes)
      : [];

    const checkProduct = await this.db("product")
      .select("p_name_en")
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
        if (item.fieldname === "new_image") {
          newImage.push({ pi_image: item.filename, pi_p_id: id });
        }
      });
      if (quantity) {
        await trx("inventory")
          .update({ i_quantity_available: quantity })
          .where({ i_p_id: id });
      }
      //  ========== Category ==============
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

      //  ========== Variants ==============

      if (removeVariants.length) {
        const checkVariant = await trx("variant_product")
          .select("id")
          .whereIn("id", removeVariants)
          .andWhere("p_id", id);
        if (!checkVariant.length) {
          return {
            success: false,
            message: "Variant not found",
          };
        }
        await trx("variant_product")
          .whereIn("id", removeVariants)
          .andWhere("p_id", id)
          .delete();
      }

      if (addedVariants.length) {
        const checkFabric = await trx("fabric")
          .select("id")
          .whereIn(
            "id",
            addedVariants.map((el: IProductVariants) => el.id)
          );

        if (checkFabric.length !== addedVariants.length) {
          throw new Error("Invalid fabric id");
        }

        const checkVariant = await trx("variant_product")
          .select("id")
          .whereIn(
            "fabric_id",
            addedVariants.map((el: IProductVariants) => el.id)
          )
          .andWhere("p_id", id);

        if (checkVariant.length) {
          return {
            success: false,
            message: "Variant already exist",
          };
        }

        await trx("variant_product").insert(
          addedVariants.map((el: IProductVariants) => {
            return { p_id: id, fabric_id: el.id, price: el.price };
          })
        );
      }

      if (editVariants.length) {
        for (const el of editVariants) {
          const checkVariant = await trx("variant_product")
            .select("id")
            .where({ id: el.id })
            .andWhere("p_id", id);

          if (!checkVariant.length) {
            throw new Error("Invalid variant id");
          }

          const checkFabric = await trx("fabric")
            .select("id")
            .where({ id: el.fabric_id });
          if (!checkFabric.length) {
            throw new Error("Invalid fabric id");
          }

          await trx("variant_product").update(el).where({ id: el.id });
        }
      }

      // ============ Parent images ===========
      const removedImageName: string[] = [];
      if (removedImage.length) {
        const checkImage = await trx("product_image")
          .select("pi_image")
          .whereIn("pi_id", removedImage)
          .andWhere("pi_p_id", id);
        if (!checkImage.length) {
          throw new Error("Invalid image id");
        }

        removedImageName.push(...checkImage.map((item) => item.pi_image));

        await trx("product_image")
          .whereIn("pi_id", removedImage)
          .andWhere("pi_p_id", id)
          .delete();
      }

      if (newImage.length) {
        await trx("product_image").insert(newImage);
      }

      // ============== Color ================
      if (addedColors.length) {
        const colorImgArray = await Promise.all(
          addedColors.map(async (colorId: number, colorIndex: number) => {
            const checkColor = await trx("color")
              .select("id")
              .where({ id: colorId });
            if (!checkColor.length) {
              throw new Error("Invalid color id");
            }

            const checkProductColor = await trx("p_color")
              .select("id")
              .where({
                p_id: id,
                color_id: colorId,
              })
              .first();
            if (checkProductColor) {
              throw new Error("Color and product color already exist");
            }

            const insertNewColor = await trx("p_color").insert({
              p_id: id,
              color_id: colorId,
            });
            const colorPhotos = files.filter(
              (file) => file.fieldname === `new_color_image_${colorIndex + 1}`
            );

            if (!colorPhotos.length) {
              throw new Error("Please provide color images");
            }
            return colorPhotos.map((photo) => ({
              p_id: id,
              p_color_id: insertNewColor[0],
              image: photo.filename,
            }));
          })
        );

        if (colorImgArray.length) {
          await trx("color_image").insert(colorImgArray[0]);
        }
      }

      // REMOVE COLOR PHOTO
      if (removedColorPhotos.length) {
        const checkColorPhotos = await trx("color_image")
          .select("image")
          .whereIn("id", removedColorPhotos as any)
          .andWhere("p_id", id);
        if (
          !checkColorPhotos.length ||
          (checkColorPhotos.length &&
            checkColorPhotos.length !== removedColorPhotos.length)
        ) {
          return {
            success: false,
            message: "Invalid Color photo ids",
          };
        }
        await trx("color_image")
          .del()
          .whereIn("id", removedColorPhotos)
          .andWhere("p_id", id);
        await this.manageFile.deleteFromStorage(
          checkColorPhotos.map((item) => item.image)
        );
      }
      // Remove colors and its photos
      if (removedColors.length) {
        const checkColors = await trx("p_color")
          .select("id")
          .whereIn("color_id", removedColors)
          .andWhere("p_id", id);
        if (
          !checkColors.length ||
          (checkColors.length && checkColors.length !== removedColors.length)
        ) {
          return {
            success: false,
            message: "Invalid color ids",
          };
        }

        const checkColorPhotos = await trx("color_image")
          .select("image")
          .whereIn("p_color_id", checkColors.map((c) => c.id) as number[])
          .andWhere("p_id", id);

        if (!checkColorPhotos.length) {
          return {
            success: false,
            message: "Unable to remove color photos from database",
          };
        }
        await trx("color_image").del().whereIn("id", removedColorPhotos);
        await this.manageFile.deleteFromStorage(
          checkColorPhotos.map((cp) => cp.image)
        );
      }

      // ==================== Sizes =================
      // add size
      if (addedSizes.length) {
        const checkSizes = await trx("size")
          .select("id")
          .whereIn("id", addedSizes);

        if (
          !checkSizes.length ||
          (checkSizes.length && checkSizes.length !== addedSizes.length)
        ) {
          return {
            success: false,
            message: "Invalid size ids",
          };
        }

        const checkSizeExists = await trx("p_size")
          .whereIn("size_id", addedSizes)
          .andWhere("p_id", id);
        if (checkSizeExists.length) {
          return {
            success: false,
            message: "Size already exists",
          };
        }
        await trx("p_size").insert(
          addedSizes.map((s) => {
            return {
              p_id: id,
              size_id: s,
            };
          })
        );
      }

      // remove size

      if (removedSizes.length) {
        const checkSizes = await trx("size")
          .select("id")
          .whereIn("id", removedSizes);

        if (
          !checkSizes.length ||
          (checkSizes.length && checkSizes.length !== removedSizes.length)
        ) {
          return {
            success: false,
            message: "Invalid size ids",
          };
        }
        const checkSizeExists = await trx("p_size")
          .select("*")
          .whereIn("size_id", removedSizes)
          .andWhere("p_id", id);
        if (!checkSizeExists.length) {
          return {
            success: false,
            message: "Size not found in this product",
          };
        }
        await trx("p_size")
          .del()
          .whereIn("size_id", removedSizes)
          .andWhere("p_id", id);
      }
      if (rest.p_name_en || rest.p_name_ar) {
        const checkProduct = await this.db("product")
          .select("p_name_en", "p_name_ar")
          .join("product_category", "pc_p_id", "p_id")
          .where((qb) => {
            if (rest.p_name_en) {
              qb.where("p_name_en", rest.p_name_en);
            }
            if (rest.p_name_ar) {
              qb.orWhere("p_name_ar", rest.p_name_ar);
            }
          });

        if (checkProduct.length) {
          return {
            success: false,
            message: "Product name in English or Arabic already exists",
          };
        }
        const p_slug = Lib.stringToSlug(rest.p_name_en);
        const checkSlug = await this.db("product").select("p_slug").where({
          p_slug,
        });
        if (checkSlug.length) {
          return {
            success: false,
            message: "Product slug already exists",
          };
        }
        rest.p_slug = p_slug;
      }

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
        message: "Product updated!",
      };
    });
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
      .select("*")
      .where("p_id", id)
      .first();

    if (!data) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    const { categories, p_images, ...rest } = data;
    return {
      success: true,
      data: { ...rest, categories, p_images },
    };
  }

  // create a product category
  public async createCategory(req: Request) {
    const { cate_name_en, cate_name_ar, cate_parent_id } = req.body;

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

    if (!files.length && !cate_parent_id) {
      return {
        success: false,
        message: "You must provide category image",
      };
    }

    const res = await this.db("category").insert({
      cate_name_en,
      cate_parent_id,
      cate_name_ar,
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
          cate_name_ar,
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
        await this.manageFile.deleteFromStorage(checkCate[0].cate_image);
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

  // Get All tags
  public async getAllTags(req: Request) {
    const { limit, skip, p_tags } = req.query;

    const data = await this.db("product")
      .select("p_tags")
      .distinct("p_tags")
      .where(function () {
        if (p_tags) {
          this.where("p_tags", "like", `%${p_tags}%`);
        }
      })
      .orderBy("p_tags", "asc")
      .limit(limit ? parseInt(limit as string) : 100)
      .offset(parseInt((skip as string) || "0"));

    const totalResult = await this.db("product")
      .countDistinct("p_tags")
      .where(function () {
        if (p_tags) {
          this.where("p_tags", "like", `%${p_tags}%`);
        }
      });
    const total = totalResult[0]?.["count(distinct `p_tags`)"] || 0;
    return {
      success: true,
      message: "Tags fetched successfully",
      total: total,
      data: data,
    };
  }
}

export default AdminProductService;
