import { Request } from "express";
import Lib from "../../../utils/lib/lib";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommCustomerService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // get customer profile
  public async getCustomerProfile(email: string) {
    const customer = await this.commonService.commonCheckCustomer(email);
    if (!customer.length) {
      return {
        success: false,
        message: "Not found",
      };
    }
    const { ec_password, ec_status, ...rest } = customer[0];
    const address = await this.db("ec_shipping_address as esa")
      .select("esa.*", "c.c_name_en", "c.c_name_ar")
      .join("country as c", "esa.country_id", "c.c_id")
      .andWhere("esa.ec_id", rest.ec_id)
      .andWhere("esa.status", 1)
      .orderBy("esa.created_at", "desc");

    return {
      success: true,
      data: { ...rest, address },
    };
  }

  //customer change password
  public async changePasswordCustomer(
    email: string,
    oldPass: string,
    newPass: string
  ) {
    const [customer] = await this.commonService.commonCheckCustomer(email);
    const verifyOldPass = await Lib.compare(oldPass, customer.ec_password);

    if (!verifyOldPass) {
      return {
        success: false,
        message: "Old password doesn't match",
      };
    }

    const hashedPass = await Lib.hashPass(newPass);

    await this.db("e_customer").update({
      ec_password: hashedPass,
    });

    return {
      success: true,
      message: "Password changed successful",
    };
  }

  // update customer profile
  public async updateCustomerProfile(req: Request) {
    const { ec_id } = req.customer;

    const checkCustomer = await this.db("e_customer")
      .select("ec_image")
      .where({ ec_id });

    const body = req.body;
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) {
      body["ec_image"] = files[0].filename;
    }

    const res = await this.db("e_customer").update(body).where({ ec_id });

    if (res) {
      if (files.length && checkCustomer[0].ec_image) {
        this.manageFile.deleteFromStorage(checkCustomer[0].ec_image);
      }

      return {
        success: true,
        data: body,
        message: "Profile updated",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  }

  // create shipping address
  public async createShippingAddress(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { ec_id } = req.customer;
      if (req.body.is_default === 1) {
        const checkCustomer = await this.db("ec_shipping_address")
          .select("*")
          .andWhere({
            ec_id,
          })
          .andWhere("is_default", 1)
          .first();
        if (checkCustomer) {
          await this.db("ec_shipping_address")
            .update({
              is_default: 0,
            })
            .where({ ec_id });
        }
      }

      const res = await trx("ec_shipping_address").insert({
        ...req.body,
        ec_id,
      });

      if (res.length) {
        return {
          success: true,
          message: "Shipping address created",
          data: {
            id: res[0],
          },
        };
      } else {
        return {
          success: false,
          message: "Cannot create shipping address now",
        };
      }
    });
  }

  // get shipping address
  public async getShippingAddress(customer_id: number) {
    const data = await this.db("ec_shipping_address as ecsa")
      .select("ecsa.*", "c.c_name_en", "c.c_name_ar")
      .leftJoin("country as c", "ecsa.country_id", "c.c_id")
      .andWhere("ecsa.ec_id", customer_id)
      .andWhere("ecsa.status", 1)
      .orderBy("ecsa.created_at", "desc");

    return {
      success: true,
      data,
    };
  }

  // update shipping address
  public async updateShippingAddress(req: Request) {
    const body = req.body;
    const { ec_id } = req.customer;
    const id = req.params.id;
    const checkAddress = await this.db("ec_shipping_address").where("id", id);
    if (!checkAddress.length) {
      return {
        success: false,
        message: "Address not found",
      };
    }
    if (req.body.is_default === 1) {
      const checkCustomer = await this.db("ec_shipping_address")
        .select("*")
        .andWhere({
          ec_id: id,
        })
        .andWhere("is_default", 1)
        .first();
      if (checkCustomer) {
        await this.db("ec_shipping_address")
          .update({
            is_default: 0,
          })
          .where({ ec_id });
      }
    }
    const res = await this.db("ec_shipping_address")
      .update(body)
      .where("id", id);

    if (res) {
      return {
        success: true,
        message: "Shipping address updated",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  }
  // delete shipping address
  public async deleteShippingAddress(req: Request) {
    const body = req.body;
    const id = req.params.id;
    const checkAddress = await this.db("ec_shipping_address").where("id", id);
    if (!checkAddress.length) {
      return {
        success: false,
        message: "Address not found",
      };
    }
    const res = await this.db("ec_shipping_address").del().where("id", id);

    if (res) {
      return {
        success: true,
        message: "Shipping address deleted",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  }
}

export default EcommCustomerService;
