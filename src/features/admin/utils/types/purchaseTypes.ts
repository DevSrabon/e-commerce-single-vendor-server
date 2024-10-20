export interface attributeValue {
  a_name: string;
  v_id: number;
  av_value: number;
}

export interface data2 {
  p_id: number;
  p_name: string;
  pp_quantity: number;
  pp_unit_price: number;
  // attribute: attributeValue[];
}
export interface IpurchaseProductAttributeValues {
  v_id: number;
  total_item: number;
}
export interface IpurchaseProduct {
  pp_p_id: number;
  pp_quantity: number;
  pp_unit_price: number;
  attribute_values?: IpurchaseProductAttributeValues[];
}

export interface IcreatePurchaseBody {
  pur_date: string;
  pur_w_id: number;
  pur_s_id: number;
  pur_discount: number;
  pur_tax: number;
  pur_created_by: number;
  purchase_product: IpurchaseProduct[];
}

export interface IpurchaseProductData {
  p_id: number;
  p_name: string;
  pp_quantity: number;
  pp_unit_price: number;
  a_name: string;
  v_id: number;
  av_value: number;
}

export interface IsupplierInvoiceBody {
  sp_inv_s_id: number;
  sp_inv_pur_id: number;
  sp_inv_grand_total: number;
}
