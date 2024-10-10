import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminAddressService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get all Countries
  public async getAllCountries(req: Request) {
    const {
      status,
      searchParams,
      sortBy = "c_name_en",
      orderBy = "asc",
    } = req.query;
    const data = await this.db("country")
      .select("c_id", "c_name_en", "c_name_ar", "c_short_name", "status")
      .where(function () {
        if (status) this.where("status", status);
        if (searchParams) {
          this.where("c_name_en", "like", `%${searchParams}%`)
            .orWhere("c_name_ar", "like", `%${searchParams}%`)
            .orWhere("c_short_name", "like", `%${searchParams}%`);
        }
      })
      .orderBy(sortBy as string, orderBy as string);
    return {
      success: true,
      data,
    };
  }

  public async createCountry(req: Request) {
    const { c_name_en, c_name_ar, c_short_name } = req.body;
    const checkCountry = await this.db("country")
      .select("c_id")
      .where(function () {
        this.where("c_name_en", c_name_en)
          .orWhere("c_name_ar", c_name_ar)
          .orWhere("c_short_name", c_short_name);
      });
    if (checkCountry.length) {
      return {
        success: false,
        message: "Already have country with this name",
      };
    }
    const data = await this.db("country").insert(req.body);
    return {
      success: true,
      message: "Country created successfully",
      data,
    };
  }

  public async updateCountry(req: Request) {
    const { id } = req.params;
    const { c_name_en, c_name_ar, c_short_name } = req.body;
    const checkCountry = await this.db("country")
      .select("*")
      .where({ c_id: id });
    if (!checkCountry.length) {
      return {
        success: false,
        message: "Country not found with this id",
      };
    }
    if (c_name_en || c_name_ar || c_short_name) {
      const isExist = await this.db("country")
        .select("c_id")
        .where(function () {
          if (c_name_en) this.where("c_name_en", c_name_en);
          if (c_name_ar) this.where("c_name_ar", c_name_ar);
          if (c_short_name) this.where("c_short_name", c_short_name);
        });

      if (isExist.length) {
        return {
          success: false,
          message: "Already have country with this name",
        };
      }
    }
    const data = await this.db("country").where("c_id", id).update(req.body);
    return {
      success: true,
      message: "Country updated successfully",
      data,
    };
  }

  // Delete Country
  public async deleteCountry(req: Request) {
    const { id } = req.params;
    const checkCountry = await this.db("country")
      .select("*")
      .where({ c_id: id });
    if (!checkCountry.length) {
      return {
        success: false,
        message: "Country not found with this id",
      };
    }
    const data = await this.db("country").where("c_id", id).del();
    return {
      success: true,
      message: "Country deleted successfully",
      data,
    };
  }

  // get all province
  public async getAllProvince(req: Request) {
    let data = [];

    data = await this.db("province").select(
      "pro_id",
      "pro_name_en",
      "pro_name_ar",
      "pro_c_id"
    );

    return {
      success: true,
      data,
    };
  }
  // get all cities by province or all
  public async getAllCitiesByProvince(req: Request) {
    const { province } = req.query;
    let data = [];

    if (province) {
      data = await this.db("city")
        .select("cit_id", "cit_name_en", "cit_name_ar")
        .where("cit_pro_id", province);
    } else {
      data = await this.db("city").select(
        "cit_id",
        "cit_name_en",
        "cit_name_ar"
      );
    }

    return {
      success: true,
      data,
    };
  }

  // get all sub city by city
  public async getAllSubCityByCity(req: Request) {
    const { city } = req.query;
    console.log({ city });
    const data = await this.db("sub_city")
      .select("scit_id", "scit_name_en", "scit_name_ar")
      .where("scit_cit_id", city);

    return {
      success: true,
      data,
    };
  }

  // create sub city
  public async createSubCity(req: Request) {
    const { name_en, name_ar, city_id } = req.body;

    const data = await this.db("sub_city").insert({
      scit_cit_id: city_id,
      scit_name_ar: name_ar,
      scit_name_en: name_en,
    });

    return {
      success: true,
      message: "Sub city created!",
      data: {
        ar_id: data[0],
      },
    };
  }

  // get all area by sub city
  public async getAllAreaBySubCity(req: Request) {
    const { sub_city } = req.query;
    const data = await this.db("area")
      .select("ar_id", "ar_name_ar", "ar_name_en")
      .where("ar_scit_id", sub_city);

    return {
      success: true,
      data,
    };
  }

  // create area
  public async createArea(req: Request) {
    const { name_en, name_ar, sub_city_id } = req.body;

    const data = await this.db("area").insert({
      ar_scit_id: sub_city_id,
      ar_name_ar: name_ar,
      ar_name_en: name_en,
    });

    return {
      success: true,
      message: "Area created!",
      data: {
        ar_id: data[0],
      },
    };
  }
}
export default AdminAddressService;
