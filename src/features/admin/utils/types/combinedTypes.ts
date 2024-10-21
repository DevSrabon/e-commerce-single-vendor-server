import { Request } from "express";

export interface customRequest<T> extends Request {
  body: T;
}

// ============== supplier type start ============//

export interface IsupplierInvoiceReqBody {
  invoice: {
    sp_inv_payment_status: string;
  };
  acc_transaction: {
    ac_tr_ac_id: number;
    ac_tr_type: string;
    ac_tr_amount: number;
    acc_ledger_details?: string;
    sp_ledger_details?: string;
  };
}
//================= supplier type end ===========//

// ------------------- order type start ---------------//

enum status {
  packaging = "packaging",
  arrived = "arrived",
  shipping = "shipping",
  shipped = "shipped",
  delivered = "delivered",
  rejected = "rejected",
  cancelled = "cancelled",
}

export interface IorderUpdateBody {
  status: status;
  remarks?: string;
  details?: string;
  payment_status?: number;
}

// ============== supplier invoice start ============//

export interface IsaleInvoiceBody {
  si_cl_id: number;
  si_w_id: number;
  si_sale_by_st_id: number;
  si_sale_date: string;
  si_vat: number;
  si_service_charge: number;
  si_discount: number;
  si_delivery_charge: number;
  invoice_item: IinvoiceItem[];
}

export interface IinvoiceItem {
  sii_p_id: number;
  sii_unit_price: number;
  sii_quantity: number;
  sii_p_v_id?: number;
}
export interface IModifyInvoiceItem {
  sii_si_id: number;
  sii_p_id: number;
  sii_name: string;
  sii_unit_price: number;
  sii_quantity: number;
  sii_p_v_id: number;
}

export interface IgetSaleProduct {
  i_id: number;
  i_p_id: number;
  i_quantity_available: number;
}

export interface IgetSaleProductInventoryAtbb {
  i_p_id: number;
  ia_id: number;
  i_v_id: number;
  ia_quantity_available: number;
}

export interface IgetSaleProductInventoryAtbb {
  i_id: number;
  i_p_id: number;
  ia_id: number;
  i_v_id: number;
  ia_quantity_available: number;
}
