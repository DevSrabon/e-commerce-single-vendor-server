import { Request } from "express";
import config from "../../../utils/config/config";
import Lib from "../../../utils/lib/lib";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommAuthService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // signup customer service
  public async signupCustomerService(req: Request) {
    const { name, email, password, type } = req.body;
    const checkCustomer = await this.commonService.commonCheckCustomer(email);

    if (checkCustomer.length) {
      return {
        success: false,
        code: 409,
        message: "This email is already exist!",
      };
    }
    let customerPayload: {
      ec_email: string;
      ec_name?: string;
      ec_password?: string;
    } = {
      ec_email: email,
      ec_name: name || undefined,
    };
    if (type === "default") {
      const hashedPass = await Lib.hashPass(password);
      customerPayload.ec_password = hashedPass;
    }

    const customer = await this.db("e_customer").insert(customerPayload);

    const customerData = {
      ec_name: name,
      ec_id: customer[0],
      ec_phone: null,
      ec_email: email,
      ec_image: null,
      ec_status: 1,
    };

    const token = Lib.createToken(
      {
        ...customerData,
        type: "customer_session",
      },
      config.JWT_SECRET_CUSTOMER,
      "7d"
    );

    return {
      success: true,
      message: "Customer registered successfully.",
      data: customerData,
      token,
    };
  }

  // login customer service
  public async loginCustomerService(req: Request) {
    const { email, password, type } = req.body;
    const checkCustomer = await this.commonService.commonCheckCustomer(email);

    if (!checkCustomer.length) {
      return {
        success: false,
        message: "Email or password is incorrect",
        code: 404,
      };
    }

    if (checkCustomer[0].ec_is_deleted === 1) {
      return {
        success: false,
        message: "Customer already deleted",
      };
    }

    if (checkCustomer[0].ec_status === 0) {
      return {
        success: false,
        code: 422,
        message: "Your account is disabled. For more information contact us.",
      };
    }

    const { ec_password, ...rest } = checkCustomer[0];
    if (type === "default") {
      const checkPass = await Lib.compare(password, ec_password);

      // if (!checkPass) {
      //   return {
      //     success: false,
      //     message: "Email or password is incorrect",
      //     code: 400,
      //   };
      // }
    }

    const token = Lib.createToken(
      { ...rest, type: "customer_session" },
      config.JWT_SECRET_CUSTOMER,
      "7d"
    );

    return {
      success: true,
      data: rest,
      token,
    };
  }

  // change customer password
  public async changeCustomerPassword(password: string, email: string) {
    const hashedPass = await Lib.hashPass(password);
    const changed = await this.db("e_customer")
      .update({
        ec_password: hashedPass,
      })
      .where({ ec_email: email });

    if (changed) {
      return {
        success: true,
        message: "Password has been changed!",
      };
    } else {
      return {
        success: false,
        message: "Cannot change password now",
      };
    }
  }

  // change customer password
  public async deleteCustomer(req: Request) {
    const { id } = req.params;

    const isExists = await this.db("e_customer")
      .select("ec_is_deleted")
      .where("ec_id", id);

    if (isExists[0].is_deleted) {
      return {
        success: false,
        code: 404,
        message: "Customer not exists",
      };
    }
    const data = await this.db("e_customer")
      .update({ ec_is_deleted: 1 })
      .where("ec_id", id);

    if (!data) {
      return {
        success: false,
        code: 401,
        message: "Customer is not found",
      };
    }

    return {
      success: true,
      code: 200,
      message: "Successfully deleted the Customer",
    };
  }
}
export default EcommAuthService;
