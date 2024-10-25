import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminCurrencyService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // Create a new currency
  public async createCurrency(req: Request) {
    const data = await this.db("currency").insert(req.body);
    return {
      success: true,
      message: "Currency created successfully",
      data,
    };
  }

  // Get all currencies
  public async getAllCurrencies(req: Request) {
    const currencies = await this.db("currency").select("*");
    return {
      success: true,
      data: currencies,
      message: "Currencies retrieved successfully",
    };
  }

  // Get a specific currency by ID
  public async getCurrencyById(req: Request) {
    const { id } = req.params;
    const currency = await this.db("currency").where("id", id).first();

    if (!currency) {
      throw new Error("Currency not found");
    }

    return {
      success: true,
      data: currency,
      message: "Currency retrieved successfully",
    };
  }

  // Update an existing currency
  public async updateCurrency(req: Request) {
    const { id } = req.params;
    const checkCurrency = await this.db("currency").select("id").where({
      id,
    });

    if (!checkCurrency.length) {
      return {
        success: false,
        message: "Currency not found",
      };
    }
    const updatedData = await this.db("currency")
      .where("id", id)
      .update(req.body);

    if (updatedData === 0) {
      throw new Error("Currency not found or no changes made");
    }

    return {
      success: true,
      message: "Currency updated successfully",
    };
  }

  // Delete a currency
  public async deleteCurrency(req: Request) {
    const { id } = req.params;
    const deletedData = await this.db("currency").where("id", id).del();

    if (deletedData === 0) {
      throw new Error("Currency not found");
    }

    return {
      success: true,
      message: "Currency deleted successfully",
    };
  }
}

export default AdminCurrencyService;
