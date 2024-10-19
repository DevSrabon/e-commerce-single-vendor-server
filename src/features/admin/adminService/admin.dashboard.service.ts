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
    const monthlySales = await this.db.raw(
      `SELECT
        DATE_FORMAT(eo_created_at, '%Y-%m') as month,
        SUM(eo_grand_total) as total_sales
     FROM
        e_order
     WHERE
        eo_created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY
        DATE_FORMAT(eo_created_at, '%Y-%m')
     ORDER BY
        DATE_FORMAT(eo_created_at, '%Y-%m')`
    );

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
      .sum("e_order_details.eod_quantity as total_sold")
      .join(
        "e_order_details",
        "product_view.p_id",
        "=",
        "e_order_details.eod_ep_id"
      )
      .groupBy(
        "product_view.p_id",
        "product_view.p_name_en",
        "product_view.p_name_ar",
        "product_view.available_stock"
      )
      .orderBy("total_sold", "desc")
      .limit(20);

    return {
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        ...dashboardData,
        stock_alert_products: stockAlarmProducts, // Add low-stock products
        monthlySales: monthlySales[0],
        productInformation,
        bestSellingProducts,
      },
    };
  }
}

export default AdminDashboardService;
