export interface IaddAttributeValIntoInventoryAttribute {
  ia_i_id: number;
  i_av_id: number;
  ia_quantity_available: number;
}

export interface IremoveAttributeValIntoInventoryAttribute
  extends IaddAttributeValIntoInventoryAttribute {}

export interface IAttributeValIntoInventoryAttribute {
  ia_i_id: number;
  i_av_id: number;
  ia_quantity_available: number;
}
