export interface IEcommCustomer {
  ec_id: number;
  ec_name: string;
  ec_phone: string | null;
  ec_email: string;
  ec_password: string;
  ec_image: string | null;
  ec_status: number;
  ec_created_at?: string;
  ec_updated_at?: string;
  ec_is_deleted: number;
}
