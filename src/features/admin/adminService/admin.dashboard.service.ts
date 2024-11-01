import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminDashboardService extends AdminAbstractServices {
  constructor() {
    super();
  }

  public async getDashboardData(req: Request) {
    // Fetch the dashboard summary data
    const data = await this.db.raw(
      `SELECT
        (SELECT count(*) FROM product_view) as total_products,
        (SELECT count(*) FROM e_customer) as total_customers,
        (SELECT count(*) FROM e_order) as total_orders,
        (SELECT count(*) FROM warehouse) as total_stores,
        (SELECT count(*) FROM staff) as total_staff`
    );

    const dashboardData = data[0][0];

    const stockAlarmProducts = await this.db("product_view")
      .select("p_id", "p_name_en", "p_name_ar", "available_stock", "all_images")
      .whereRaw("available_stock <= stock_alert")
      .limit(20);

    // Fetch total sales for the last 6 months
    const monthlySales = await this.db.raw(`
      SELECT
        months.month,
        COALESCE(SUM(e_order.grand_total), 0) AS total_sales
      FROM
        (
          SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL num MONTH), '%Y-%m') AS month
          FROM (
            SELECT 0 AS num UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
            UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
          ) AS numbers
        ) AS months
      LEFT JOIN
        e_order
      ON
        DATE_FORMAT(e_order.created_at, '%Y-%m') = months.month
      GROUP BY
        months.month
      ORDER BY
        months.month;
    `);

    const productInformation = await this.db("product_view")
      .select("p_id", "p_name_en", "p_name_ar", "available_stock")
      .where("p_status", 1)
      .andWhere("available_stock", ">", 0)
      .limit(20)
      .orderBy("available_stock", "asc");
    const bestSellingProducts = await this.db("product_view")
      .select(
        "product_view.p_id",
        "product_view.p_name_en",
        "product_view.p_name_ar",
        "product_view.available_stock"
      )
      .sum("e_order_details.quantity as total_sold")
      .join(
        "e_order_details",
        "product_view.p_id",
        "=",
        "e_order_details.ep_id"
      )
      .groupBy(
        "product_view.p_id",
        "product_view.p_name_en",
        "product_view.p_name_ar",
        "product_view.available_stock"
      )
      .orderBy("total_sold", "desc")
      .limit(20);

    const todayCurrency = await this.db("currency")
      .select("aed", "usd", "gbp", "updated_at")
      .first();

    return {
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        ...dashboardData,
        todayCurrency,
        stock_alert_products: stockAlarmProducts,
        monthlySalesLast12Months: monthlySales[0],
        productInformation,
        bestSellingProducts,
      },
    };
  }
}

export default AdminDashboardService;
