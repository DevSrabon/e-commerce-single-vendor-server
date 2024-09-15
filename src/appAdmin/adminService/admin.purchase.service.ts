import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';
import {
  IcreatePurchaseBody,
  IpurchaseProduct,
  IpurchaseProductData,
  IsupplierInvoiceBody,
} from '../utils/types/purchaseTypes';
import { IAttributeValIntoInventoryAttribute } from '../utils/types/inventoryTypes';

class AdminPurchaseService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // purchase
  public async createPurchaseService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const {
        pur_date,
        pur_w_id,
        pur_s_id,
        pur_discount,
        pur_tax,
        pur_created_by,
        purchase_product,
      } = req.body as IcreatePurchaseBody;

      let totalAmount = 0;

      purchase_product.forEach(async (item) => {
        totalAmount += item.pp_unit_price * item.pp_quantity;
        const inventoryUpdate = await trx.raw(
          `UPDATE inventory set i_quantity_available = i_quantity_available + ? where i_w_id = ? and i_p_id = ?`,
          [item.pp_quantity, pur_w_id, item.pp_p_id]
        );

        console.log(inventoryUpdate[0].affectedRows);

        if (inventoryUpdate[0].affectedRows) {
          if (item.attribute_values?.length) {
            const newAttribute: IAttributeValIntoInventoryAttribute[] = [];
            item.attribute_values.forEach(async (attribute) => {
              const inventoryAttribute = await trx.raw(
                `UPDATE inventory_attribute set ia_quantity_available = ia_quantity_available + ? where ia_i_id = (select i_id from inventory where i_w_id = ? and i_p_id = ?) and i_av_id = ?`,
                [attribute.total_item, pur_w_id, item.pp_p_id, attribute.av_id]
              );

              if (!inventoryAttribute[0].affectedRows) {
                newAttribute.push({
                  ia_i_id: inventoryUpdate[0].i_id,
                  i_av_id: attribute.av_id,
                  ia_quantity_available: attribute.total_item,
                });
              }
            });
            if (newAttribute.length) {
              await trx('inventory_attribute').insert(newAttribute);
            }
          }
        } else {
          const newInventory = await trx('inventory').insert({
            i_w_id: pur_w_id,
            i_p_id: item.pp_p_id,
            i_quantity_available: item.pp_quantity,
          });

          if (item.attribute_values?.length) {
            const newAttribute: IAttributeValIntoInventoryAttribute[] = [];
            item.attribute_values.forEach(async (attribute) => {
              newAttribute.push({
                ia_i_id: newInventory[0],
                i_av_id: attribute.av_id,
                ia_quantity_available: attribute.total_item,
              });
            });
            await trx('inventory_attribute').insert(newAttribute);
          }
        }
      });

      const discountAmount: number = (totalAmount * pur_discount) / 100;
      const TaxAmount: number = (totalAmount * pur_tax) / 100;
      const grandTotalAmount: number =
        totalAmount - (discountAmount + TaxAmount);

      const purchaseRes = await trx('purchase').insert({
        pur_date,
        pur_w_id,
        pur_s_id,
        pur_total: totalAmount,
        pur_discount,
        pur_discount_total: discountAmount,
        pur_tax,
        pur_tax_total: TaxAmount,
        pur_grand_total: grandTotalAmount,
        pur_created_by,
      });

      // purchase product
      const pur_product = purchase_product.map((item: IpurchaseProduct) => {
        return {
          pp_pur_id: purchaseRes[0],
          pp_p_id: item.pp_p_id,
          pp_quantity: item.pp_quantity,
          pp_unit_price: item.pp_unit_price,
        };
      });

      await trx('pur_product').insert(pur_product);

      // supplier invoice
      let supplierInvoiceBody: IsupplierInvoiceBody = {
        sp_inv_s_id: pur_s_id,
        sp_inv_pur_id: purchaseRes[0],
        sp_inv_grand_total: grandTotalAmount,
      };

      const supplierInvoiceRes = await trx('supplier_invoice').insert(
        supplierInvoiceBody
      );

      if (supplierInvoiceRes.length) {
        return {
          success: true,
          message: 'Purchase has been done',
        };
      } else {
        return {
          success: false,
          message: 'Cannot purchase at this moment',
        };
      }
    });
  }

  // get all purchase product
  public async getAllPurchaseProductService(req: Request) {
    const {
      limit,
      skip,
      order_by = 'pur_date',
      according_order = 'desc',
      from_date,
      to_date,
      w_id,
    } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('purchase AS p');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        'p.pur_id',
        'p.pur_date',
        'p.pur_w_id',
        'wh.w_name',
        'p.pur_s_id',
        's.s_name',
        'p.pur_created_by',
        'au.au_name',
        'p.pur_grand_total'
      )
      .join('warehouse AS wh', 'p.pur_w_id', 'wh.w_id')
      .join('supplier AS s', 'p.pur_s_id', 's.s_id')
      .join('admin_user AS au', 'p.pur_created_by', 'au.au_id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.pur_date', [from_date as string, endDate]);
        }
        if (w_id) {
          this.andWhere('p.pur_w_id', w_id);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = (
      await this.db('purchase AS p')
        .count('p.pur_id AS total')
        .join('warehouse AS wh', 'p.pur_w_id', 'wh.w_id')
        .join('supplier AS s', 'p.pur_s_id', 's.s_id')
        .join('admin_user AS au', 'p.pur_created_by', 'au.au_id')
        .where(function () {
          if (from_date && to_date) {
            this.andWhereBetween('p.pur_date', [from_date as string, endDate]);
          }
          if (w_id) {
            this.andWhere('p.pur_w_id', w_id);
          }
        })
    )[0].total;

    return {
      success: true,
      data,
      total: count,
    };
  }

  //========= get all purchase for report ledger ===========//
  public async getAllPurchaseForReportLedgerService(req: Request) {
    const {
      limit,
      skip,
      order_by = 'pur_id',
      according_order = 'desc',
      from_date,
      to_date,
      w_id,
      pur_s_id,
    } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);
    const dtbs = this.db('purchase AS p');
    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }
    const data = await dtbs
      .select(
        'p.pur_id',
        'p.pur_date',
        'p.pur_w_id',
        'wh.w_name',
        'p.pur_s_id',
        's.s_name',
        'p.pur_grand_total'
      )
      .join('warehouse AS wh', 'p.pur_w_id', 'wh.w_id')
      .join('supplier AS s', 'p.pur_s_id', 's.s_id')
      .join('admin_user AS au', 'p.pur_created_by', 'au.au_id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.pur_date', [from_date as string, endDate]);
        }
        if (w_id) {
          this.andWhere('p.pur_w_id', w_id);
        }
      })
      .orderBy(order_by as string, according_order as string);

    // total balance
    const totalPurchaseBalance = await dtbs
      .sum('p.pur_grand_total AS total')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.pur_date', [from_date as string, endDate]);
        }
        if (w_id) {
          this.andWhere('p.pur_w_id', w_id);
        }
      });

    const count = await this.db('purchase AS p')
      .count('p.pur_id AS total')
      .join('warehouse AS wh', 'p.pur_w_id', 'wh.w_id')
      .join('supplier AS s', 'p.pur_s_id', 's.s_id')
      .join('admin_user AS au', 'p.pur_created_by', 'au.au_id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.pur_created_at', [
            from_date as string,
            endDate,
          ]);
        }

        if (w_id) {
          this.andWhere('p.pur_w_id', w_id);
        }
      });

    return {
      success: true,
      total: count[0].total,
      total_report_balance: totalPurchaseBalance[0].total,
      data,
    };
  }

  // get single purchase product
  public async getSinglePurchaseProductService(req: Request) {
    const { id } = req.params;
    const purchaseData = await this.db('purchase AS p')
      .select(
        'p.pur_id',
        'p.pur_date',
        'p.pur_w_id',
        'wh.w_name',
        'p.pur_s_id',
        's.s_name',
        'p.pur_total',
        'p.pur_discount',
        'p.pur_discount_total',
        'p.pur_tax',
        'p.pur_tax_total',
        'p.pur_grand_total',
        'p.pur_created_by',
        'p.pur_created_at',
        'au.au_name'
      )
      .leftJoin('warehouse AS wh', 'p.pur_w_id', 'wh.w_id')
      .leftJoin('supplier AS s', 'p.pur_s_id', 's.s_id')
      .leftJoin('admin_user AS au', 'p.pur_created_by', 'au.au_id')
      .where('p.pur_id', id);

    const purchaseProductdata: IpurchaseProductData[] = await this.db(
      'pur_product AS pp'
    )
      .select('pd.p_id', 'pd.p_name', 'pp.pp_quantity', 'pp.pp_unit_price')
      .leftJoin('product AS pd', 'pp.pp_p_id', 'pd.p_id')
      .leftJoin('purchase AS p', 'pp.pp_pur_id', 'p.pur_id')
      .where('p.pur_id', id);

    // invoice by purchase id
    const invoiceRes = await this.db('supplier_invoice')
      .select(
        'sp_inv_id',
        'sp_inv_s_id',
        'sp_inv_pur_id',
        'sp_inv_grand_total',
        'sp_inv_payment_status'
      )
      .where('sp_inv_pur_id', id);

    return {
      success: true,
      data: {
        ...purchaseData[0],
        purchaseProducts: purchaseProductdata,
        invoice: invoiceRes,
      },
    };
  }
}

export default AdminPurchaseService;
