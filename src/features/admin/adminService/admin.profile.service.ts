import { Request } from "express";
import Lib from "../../../utils/lib/lib";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminProfileService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get admin profile data
  public async getAdminProfileData(req: Request) {
    const { au_id } = req.user;

    const data = await this.db("admin_user AS au")
      .select(
        "au.au_id",
        "au.au_name",
        "au.au_phone",
        "au.au_email",
        "au.au_photo",
        "r.role_name"
      )
      .join("role AS r", "au.au_role", "r.role_id")
      .where("au_id", au_id)
      .first();
    if (data) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: "User not found",
      };
    }
  }

  // update admin profile data
  public async updateAdminProfile(req: Request) {
    const { au_id } = req.user;
    const body = req.body;

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) {
      body["au_photo"] = files[0].filename;
    }
    if (!Object.keys(body).length) {
      return {
        code: 412,
        success: false,
        message: "No data to update",
      };
    }
    const data = await this.db("admin_user AS au")
      .select("au.au_id", "au.au_photo")
      .where("au_id", au_id)
      .first();
    if (!data) {
      return {
        code: 404,
        success: false,
        message: "User not found",
      };
    }
    await this.db("admin_user").update(body).where({ au_id });
    if (data.au_photo && files.length) {
      await this.manageFile.deleteFromStorage(data.au_photo);
    }
    return {
      code: 200,
      success: true,
      message: "Successfully updated!",
    };
  }
  // update admin profile data
  public async changePassword(req: Request) {
    const { au_id } = req.user;
    const { old_password, new_password } = req.body;
    if (old_password === new_password) {
      return {
        code: 412,
        success: false,
        message: "New password can't be old password",
      };
    }

    const data = await this.db("admin_user AS au")
      .select("au.au_password")
      .where("au_id", au_id)
      .first();
    if (!data) {
      return {
        code: 404,
        success: false,
        message: "User not found",
      };
    }

    const oldPassCheck = await Lib.compare(old_password, data.au_password);
    if (!oldPassCheck) {
      return {
        code: 412,
        success: false,
        message: "Old password is incorrect",
      };
    }
    const hashPass = await Lib.hashPass(new_password);

    await this.db("admin_user")
      .update({ au_password: hashPass })
      .where({ au_id });
    return {
      code: 200,
      success: true,
      message: "Successfully changed password!",
    };
  }
}
export default AdminProfileService;
