import axios from "axios";
import cron from "node-cron";
import { db } from "../../../app/database";
import config from "../../../utils/config/config";
import AdminAbstractRouter from "../adminAbstracts/admin.abstract.router";
import AdminCurrencyController from "../adminController/admin.currency.controller";
class AdminCurrencyRouter extends AdminAbstractRouter {
  private controller = new AdminCurrencyController();

  constructor() {
    super();
    this.callRouter();
    this.updateCurrencyJOB();
  }

  // update Currency
  private updateCurrencyJOB() {
    // every day night
    cron.schedule("0 0 * * *", async () => {
      try {
        console.log("running a task every day at 00:00");
        const currency = await axios.get(
          `https://api.exchangeratesapi.io/v1/latest?access_key=${config.CURRENCY_API_KEY}`
        );

        const eurToAed = currency.data.rates.AED;
        const usdToEur = currency.data.rates.USD;
        const gbpToEur = currency.data.rates.GBP;
        const usd = parseFloat((usdToEur / eurToAed).toFixed(3));
        const gbp = parseFloat((gbpToEur / eurToAed).toFixed(3));
        console.log({ usd, gbp });
        await db("currency")
          .update({
            usd,
            gbp,
          })
          .where({ id: 1 });
      } catch (error) {
        console.log("error from currency api", error);
      }
    });
  }

  private callRouter() {
    // Currency routes
    this.router
      .route("/")
      .post(
        // this.productValidator.createCurrencyValidator(),
        this.controller.createCurrency
      )
      .get(
        // this.productValidator.getAllCurrencyQueryValidator(),
        this.controller.getAllCurrencies
      );

    this.router
      .route("/:id")
      .get(
        this.commonValidator.singleParamInputValidator(),
        this.controller.getCurrencyById
      )
      .patch(
        this.commonValidator.singleParamInputValidator(),
        // this.productValidator.updateCurrencyValidator(),
        this.controller.updateCurrency
      )
      .delete(
        this.commonValidator.singleParamInputValidator(),
        this.controller.deleteCurrency
      );
  }
}

export default AdminCurrencyRouter;
