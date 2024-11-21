export interface IOrderStatus {
  orderId: string;
  orderDate: string;
  status: string;
  deliveryDate?: string;
  amount: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  customer: { name: string; email: string; address: string; phone: string };
  items: { name: string; amount: number; quantity: number; image?: string }[];
}

export interface OrderDetail {
  sku: string;
  slug: string;
  price: string;
  size_id: number;
  quantity: number;
  size_name: string;
  created_at: string;
  p_color_id: number;
  product_id: number;
  variant_id: number;
  color_images: string[];
  color_name_en: string;
  fabric_name_en: string;
  order_detail_id: number;
  product_name_ar: string;
  product_name_en: string;
}

export interface IOrder {
  id: number;
  order_no: string;
  status: string;
  currency: string;
  payment_status: number;
  total: string;
  discount: string;
  delivery_charge: string;
  grand_total: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address_name: string;
  address_phone: string;
  address_apt: string;
  address_street_address: string;
  address_label: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country_id: number;
  address_country_name_en: string;
  address_country_name_ar: string;
  order_details: OrderDetail[];
  tracking_status: any[];
}
