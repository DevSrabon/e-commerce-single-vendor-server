import { Request } from "express";
import AbstractServices from "../adminAbstracts/admin.abstract.service";
import Lib from "../../utils/lib/lib";
import config from "../../utils/config/config";
import { IForgetPassProps } from "../utils/types/adminTypes";

class AdminAuthService extends AbstractServices {
  constructor() {
    super();
  }

  // create admin
  public async createAdmin(req: Request) {
    const { au_name, au_phone, au_email, au_password, au_role } = req.body;

    const files = (req.files as Express.Multer.File[]) || [];

    if (au_password.length < 9) {
      return {
        success: false,
        message: "Password length must be at least 9",
      };
    }

    const checkAdmin = await this.db
      .select("au_phone", "au_email")
      .from("admin_user")
      .orWhere({ au_phone })
      .orWhere({ au_email });

    if (checkAdmin.length) {
      if (checkAdmin[0].au_phone === au_phone) {
        return {
          success: false,
          message: "Phone number already exist!",
        };
      }

      if (checkAdmin[0].au_email === au_email) {
        return {
          success: false,
          message: "Email address already exist!",
        };
      }
    }

    const hashedPassword = await Lib.hashPass(au_password);

    const res = await this.db("admin_user").insert({
      au_name,
      au_phone,
      au_email,
      au_password: hashedPassword,
      au_photo: files[0]?.filename,
      au_role,
    });

    if (res.length) {
      const token = Lib.createToken(
        {
          au_id: res[0],
          au_name,
          au_phone,
          au_email,
          au_photo: files[0]?.filename,
          au_role,
        },
        config.JWT_SECRET_ADMIN,
        "1d"
      );

      return {
        success: true,
        data: {
          au_id: res[0],
        },
        token,
      };
    } else {
      return {
        success: false,
        message: "Cannot create admin now!",
      };
    }
  }

  // login admin
  public async loginAdmin(req: Request) {
    const { email, password } = req.body;
    console.log("working..");
    const checkAdmin = await this.db("admin_user AS au")
      .select(
        "au.au_id",
        "au.au_name",
        "au.au_phone",
        "au.au_email",
        "au.au_password",
        "au.au_photo",
        "r.role_name"
      )
      .join("role AS r", "au.au_role", "r.role_id")
      .where({ au_email: email });

    if (!checkAdmin.length) {
      return {
        success: false,
        message: "Admin not found!",
      };
    }

    const { au_password, ...rest } = checkAdmin[0];
    const checkPass = await Lib.compare(password, au_password);

    if (!checkPass) {
      return {
        success: false,
        message: "Wrong password!",
      };
    }

    const token = Lib.createToken(
      {
        ...rest,
        type: "admin",
      },
      config.JWT_SECRET_ADMIN,
      "1d"
    );

    return {
      success: true,
      data: rest,
      token,
    };
  }

  // forget password change service
  public async forgetPassword({
    table,
    passField,
    password,
    userEmailField,
    userEmail,
  }: IForgetPassProps) {
    const hashedPass = await Lib.hashPass(password);
    const updatePass = await this.db(table)
      .update(passField, hashedPass)
      .where(userEmailField, userEmail);

    if (updatePass) {
      return {
        success: true,
        message: "Password changed successfully!",
      };
    } else {
      return {
        success: true,
        message: "Cannot change password now!",
      };
    }
  }
}

export default AdminAuthService;
