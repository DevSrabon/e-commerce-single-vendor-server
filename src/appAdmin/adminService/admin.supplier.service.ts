import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';
import { IsupplierInvoiceReqBody } from '../utils/types/combinedTypes';
import Lib from '../../utils/lib/lib';

class AdminSupplierService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create a supplier service
  public async createSupplier(req: Request) {
    const body = req.body;
    const checkSup = await this.db('supplier')
      .select('s_id')
      .orWhere('s_phone', body.s_phone)
      .orWhere('s_email', body.s_email);

    if (checkSup.length) {
      return {
        success: false,
        message: 'Email or phone already exist',
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files[0]?.filename) {
      body.s_image = files[0]?.filename;
    }

    return await this.db.transaction(async (trx) => {
      let s_slug = Lib.stringToSlug(body.s_name);

      const data = await trx('supplier').insert(body);

      const checkSlug = await trx('supplier').select('s_id').where({ s_slug });

      if (checkSlug.length) {
        s_slug += '-' + data[0];
      }

      await trx('supplier').update({ s_slug }).where('s_id', data[0]);

      return {
        success: true,
        data: {
          s_id: data[0],
          s_image: body.s_image,
        },
        message: 'Supplier created successfully',
      };
    });
  }

  // get suppliers
  public async getSuppliers(req: Request) {
    const {
      s_name,
      area,
      sub_city,
      city,
      s_status,
      limit,
      skip,
      order_by = 's_name',
      according_order = 'asc',
    } = req.query;

    const dtbs = this.db('supplier AS s');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    let data = [];

    data = await dtbs
      .select(
        's.s_id',
        's.s_name',
        's.s_status',
        's.s_image',
        'cit.cit_id',
        'cit.cit_name_en'
      )
      .join('area AS ar', 's.s_ar_id', 'ar.ar_id')
      .join('sub_city AS scit', 'ar.ar_scit_id', 'scit.scit_id')
      .join('city AS cit', 'scit.scit_cit_id', 'cit.cit_id')
      .where(function () {
        if (s_name) {
          this.andWhere('s.s_name', 'like', `%${s_name}%`);
        }
        if (s_status) {
          this.andWhere('s.s_status', s_status);
        }
        if (area) {
          this.andWhere('ar.ar_id', area);
        }
        if (sub_city) {
          this.andWhere('scit.scit_id', sub_city);
        }
        if (city) {
          this.andWhere('cit.cit_id', city);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = await this.db('supplier AS s')
      .count('s.s_id as total')
      .join('area AS ar', 's.s_ar_id', 'ar.ar_id')
      .join('sub_city AS scit', 'ar.ar_scit_id', 'scit.scit_id')
      .join('city AS cit', 'scit.scit_cit_id', 'cit.cit_id')
      .where(function () {
        if (s_name) {
          this.andWhere('s.s_name', 'like', `%${s_name}%`);
        }
        if (s_status) {
          this.andWhere('s.s_status', s_status);
        }
        if (area) {
          this.andWhere('ar.ar_id', area);
        }
        if (sub_city) {
          this.andWhere('scit.scit_id', sub_city);
        }
        if (city) {
          this.andWhere('cit.cit_id', city);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total as number,
    };
  }

  // get a single supplier
  public async getSingleSupplier(id: number) {
    const data = await this.db('supplier AS s')
      .select(
        's.s_id',
        's.s_name',
        's.s_phone',
        's.s_email',
        's.s_address',
        's.s_status',
        's.s_image',
        'av.province_name',
        'av.city_name',
        'av.sub_city_name',
        'av.area_name',
        's.s_created_at'
      )
      .leftJoin('address_view AS av', 's.s_ar_id', 'av.area_id')

      .where('s.s_id', id);

    // supplier invoice
    const invoiceRes = await this.db('supplier_invoice')
      .select(
        'sp_inv_id',
        'sp_inv_pur_id',
        'sp_inv_grand_total',
        'sp_inv_payment_status'
      )
      .where('sp_inv_s_id', id);

    if (data.length) {
      return {
        success: true,
        data: { ...data[0], invoice: invoiceRes },
      };
    } else {
      return {
        success: false,
        message: 'Supplier not found with this id',
      };
    }
  }

  // update single supplier
  public async updateSingleSupplier(req: Request) {
    const { s_name } = req.body;
    const { id } = req.params;

    const checkSupplier = await this.db('supplier')
      .select('s_id', 's_slug')
      .where('s_id', id);

    if (!checkSupplier.length) {
      return {
        success: false,
        message: 'Supplier not found with this id',
      };
    }

    if (s_name) {
      let s_slug = Lib.stringToSlug(s_name);
      s_slug += '-' + checkSupplier[0].s_id;

      req.body['s_slug'] = s_slug;
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }

    const res = await this.db('supplier').update(req.body).where('s_id', id);

    if (res) {
      return {
        success: true,
        message: 'Supplier updated successfully',
      };
    } else {
      return {
        success: false,
        message: 'Supplier cannot update now',
      };
    }
  }

  // get all suppliers invoice
  public async getAllSupplierInvoice(req: Request) {
    const {
      limit,
      skip,
      order_by = 'sp_inv_id',
      according_order = 'asc',
      payment_status,
      s_name,
    } = req.query;

    const dtbs = this.db('supplier_invoice AS si');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    let data = [];

    data = await dtbs
      .select(
        'si.sp_inv_id',
        'si.sp_inv_grand_total',
        'si.sp_inv_payment_status',
        's.s_name',
        's.s_image'
      )
      .join('supplier AS s', 'si.sp_inv_s_id', 's.s_id')
      .where(function () {
        if (payment_status) {
          this.andWhere('si.sp_inv_payment_status', payment_status);
        }
        if (s_name) {
          this.andWhere('s.s_name', s_name);
        }
      })
      .orderBy(order_by as string, according_order as string);

    return {
      success: true,
      data,
      // total: count[0].total as number,
    };
  }

  // get a single supplier invoice
  public async getSingleSupplierInvoice(req: Request) {
    const { id } = req.params;

    // supplier invoice
    const invoiceRes = await this.db('supplier_invoice AS si')
      .select(
        'si.sp_inv_id',
        'si.sp_inv_s_id',
        'si.sp_inv_pur_id',
        'si.sp_inv_grand_total',
        'si.sp_inv_payment_status',
        'p.pur_id',
        'p.pur_tax',
        'p.pur_tax_total',
        'p.pur_discount',
        'p.pur_discount_total',
        'p.pur_grand_total'
      )
      .join('purchase AS p', 'si.sp_inv_pur_id', 'p.pur_id')
      .where('si.sp_inv_id', id);

    const proudctUnderInvoice = await this.db('pur_product AS pp')
      .select('pd.p_id', 'pd.p_name', 'pp.pp_quantity', 'pp.pp_unit_price')
      .leftJoin('product AS pd', 'pp.pp_p_id', 'pd.p_id')
      .where('pp.pp_pur_id', invoiceRes[0].sp_inv_pur_id);

    const data = await this.db('supplier AS s')
      .select(
        's.s_id',
        's.s_name',
        's.s_phone',
        's.s_email',
        's.s_address',
        's.s_image',
        'av.province_name',
        'av.city_name',
        'av.sub_city_name',
        'av.area_name'
      )
      .join('address_view AS av', 's.s_ar_id', 'av.area_id')
      .where('s.s_id', invoiceRes[0].sp_inv_s_id);

    if (invoiceRes.length) {
      return {
        success: true,
        data: { ...data[0], invoice: invoiceRes[0], proudctUnderInvoice },
      };
    } else {
      return {
        success: false,
        message: 'Supplier not found with this id',
      };
    }
  }

  // update supplier invoice
  public async updateSupplierInvoice(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { invoice, acc_transaction } = req.body as IsupplierInvoiceReqBody;

      const {
        ac_tr_ac_id,
        ac_tr_type,
        ac_tr_amount,
        acc_ledger_details,
        sp_ledger_details,
      } = acc_transaction;

      let res;
      if (invoice.sp_inv_payment_status === 'paid') {
        const checkPaidOrNot = await this.db('supplier_invoice')
          .select('sp_inv_payment_status')
          .where({ sp_inv_id: id });

        if (
          checkPaidOrNot.length &&
          checkPaidOrNot[0].sp_inv_payment_status === 'paid'
        ) {
          return {
            success: false,
            message: 'Already Paid',
          };
        }

        res = await trx('supplier_Invoice')
          .update({
            ...invoice,
          })
          .where('sp_inv_id', id);

        // update purchase
        await trx('supplier_Invoice AS si')
          .update({
            pur_payment_status: 1,
          })
          .join('purchase As p', 'si.sp_inv_pur_id', 'p.pur_id')
          .where('sp_inv_id', id);

        // account transaction
        const acTransactionRes = await trx('ac_transaction').insert({
          ac_tr_ac_id,
          ac_tr_amount,
          ac_tr_type,
        });

        // account ledger supplier
        const checkAccountLedger = await this.db('acc_ledger')
          .select(
            'acc_ledger_account_id',
            'acc_ledger_debit_amount',
            'acc_ledger_credit_amount',
            'acc_ledger_balance'
          )
          .where({ acc_ledger_account_id: ac_tr_ac_id });

        let totalDebitBalance: number = 0;
        let totalCreditBalance: number = 0;

        if (checkAccountLedger.length) {
          totalDebitBalance = checkAccountLedger.reduce((acc, curr) => {
            return (acc += parseFloat(curr.acc_ledger_debit_amount));
          }, 0);

          totalCreditBalance = checkAccountLedger.reduce((acc, curr) => {
            return (acc += parseFloat(curr.acc_ledger_credit_amount));
          }, 0);
        }

        let tb = totalCreditBalance - (totalDebitBalance + ac_tr_amount);

        // account ledger transaction
        await trx('acc_ledger').insert({
          acc_ledger_account_id: ac_tr_ac_id,
          acc_ledger_debit_amount: ac_tr_amount,
          acc_ledger_balance: tb.toFixed(2),
          acc_ledger_details,
        });

        // supplier transaction
        const spTransactionRes = await trx('sp_transaction').insert({
          sp_inv_id: id,
          ac_tr_id: acTransactionRes[0],
          sp_t_total_amount: ac_tr_amount,
        });

        // supplier ledger
        let supplierLdObj: any = {
          sp_t_id: spTransactionRes[0],
        };

        if (sp_ledger_details) {
          supplierLdObj['sp_ledger_details'] = sp_ledger_details;
        }
        await trx('supplier_ledger').insert(supplierLdObj);
      }

      if (res) {
        return {
          success: true,
          message: 'Supplier invoice updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Supplier invoice cannot update',
        };
      }
    });
  }

  // ============supplier ledger and report ==============//

  public async getAllReportBySupplier(req: Request) {
    const { limit, skip, from_date, to_date } = req.query;

    const { id } = req.params;
    const dtbs = this.db('supplier_invoice AS si');

    let endDate: any = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    let data = [];
    data = await dtbs
      .select(
        'p.pur_id',
        'w.w_id',
        'w.w_name',
        'p.pur_grand_total',
        'p.pur_created_at'
      )
      .leftJoin('purchase AS p', 'si.sp_inv_pur_id', 'p.pur_id')
      .leftJoin('warehouse AS w', 'p.pur_w_id', 'w.w_id')
      .where(function () {
        this.andWhere('si.sp_inv_s_id', id);
        if (from_date && to_date) {
          this.whereBetween('p.pur_date', [from_date as string, endDate]);
        }
      })
      .where(function () {});

    const totalSupplierBalance = await this.db('supplier_invoice AS si')
      .sum('p.pur_grand_total AS total')
      .join('purchase AS p', 'si.sp_inv_pur_id', 'p.pur_id')
      .join('warehouse AS w', 'p.pur_w_id', 'w.w_id')
      .where(function () {
        this.andWhere('si.sp_inv_s_id', id);
        if (from_date && to_date) {
          this.whereBetween('p.pur_date', [from_date as string, endDate]);
        }
      });

    return {
      success: true,
      total_report_balance: totalSupplierBalance[0].total,
      data,
    };
  }

  // ledger
  public async getAllLedgerBySupplier(req: Request) {
    const {
      limit,
      skip,
      from_date,
      to_date,
      w_id,
      order_by = 'pur_id',
      according_order = 'asc',
    } = req.query;

    const { id } = req.params;
    const dtbs = this.db('supplier_ledger AS sldg');

    let endDate: any = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const sellBySellerPurchasedata = await dtbs
      .select(
        'p.pur_id',
        'w.w_id',
        'w.w_name',
        'p.pur_grand_total',
        'p.pur_discount_total',
        'p.pur_tax_total',
        'p.pur_created_at'
      )
      .leftJoin('sp_transaction AS st', 'sldg.sp_t_id', 'st.sp_t_id')
      .leftJoin('supplier_invoice AS si', 'st.sp_inv_id', 'si.sp_inv_id')
      .leftJoin('purchase AS p', 'si.sp_inv_pur_id', 'p.pur_id')
      .leftJoin('warehouse AS w', 'p.pur_w_id', 'w.w_id')

      .where(function () {
        this.andWhere('si.sp_inv_s_id', id);

        if (from_date && to_date) {
          this.whereBetween('sldg.sp_ledger_created_at', [
            from_date as string,
            endDate,
          ]);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const supplierPaymentHistory = await this.db('supplier_ledger AS sldg')
      .select(
        'p.pur_id',
        'p.pur_date',
        'st.sp_t_total_amount',
        'sldg.sp_ledger_details',
        'ac.ac_name',
        'ac.ac_type AS transaction_type'
      )
      .leftJoin('sp_transaction AS st', 'sldg.sp_t_id', 'st.sp_t_id')
      .leftJoin('ac_transaction AS at', 'st.ac_tr_id', 'at.ac_tr_id')
      .leftJoin('accounts AS ac', 'at.ac_tr_ac_id', 'ac.ac_id')
      .leftJoin('supplier_invoice AS si', 'st.sp_inv_id', 'si.sp_inv_id')
      .leftJoin('purchase AS p', 'si.sp_inv_pur_id', 'p.pur_id')
      .where(function () {
        this.andWhere('si.sp_inv_s_id', id);

        if (from_date && to_date) {
          this.whereBetween('sldg.sp_ledger_created_at', [
            from_date as string,
            endDate,
          ]);
        }
      });

    return {
      success: true,
      data: {
        sellBySellerPurchasedata,
        supplierPaymentHistory,
      },
    };
  }
}
export default AdminSupplierService;
