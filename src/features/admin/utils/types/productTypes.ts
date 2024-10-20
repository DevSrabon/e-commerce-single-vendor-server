// product transfer start
interface IpdTransfer {
  pt_from_w_id: number;
  pt_to_w_id: number;
  pt_send_date: string;
  pt_created_by: number;
}

interface IptProduct {
  ptp_p_id: number;
  ptp_quantity: number;
}
export interface IptAttribute {
  ptpa_v_id: number;
  ptp_p_id: number;
  ptpa_quantity: number;
}
export interface ItransferProductRequest {
  p_transfer: IpdTransfer;
  pt_product: IptProduct[];
  ptp_variant: IptAttribute[];
}

export interface IaddInventoryProduct {
  i_w_id: number;
  i_p_id: number;
  i_quantity_available: number;
}
export interface IptpAttributeVal {
  ptpa_v_id: number;
  ptpa_quantity: number;
  ptpa_ptp_id: number;
}

export interface IremoveInventoryProduct extends IaddInventoryProduct {}

export interface IptProductInput {
  ptp_pt_id: number;
  ptp_p_id: number;
  ptp_quantity: number;
}
export interface IgetTransferProductInventoryAtbb {
  i_p_id: number;
  ia_id: number;
  i_v_id: number;
  ia_quantity_available: number;
}

export interface IUpdateInventoryProduct {
  i_p_id: number;
  i_quantity_available: number;
}

export interface IremoveProductFromInventory {
  i_p_id: number;
  i_quantity_available: number;
}
export interface IgetPtProduct {
  ptp_id: number;
  ptp_pt_id: number;
  ptp_p_id: number;
  ptp_quantity: number;
}

export interface IgetProductTpAttb {
  ptp_id: number;
  ptp_p_id: number;
  ptpa_id: number;
  ptpa_v_id: number;
  ptpa_quantity: number;
}

export interface IaddProductIntoInventory {
  i_w_id: number;
  i_p_id: number;
  i_quantity_available: number;
}
export interface IgetTransferProduct {
  i_id: number;
  i_p_id: number;
  i_quantity_available: number;
}
// product transfer end
