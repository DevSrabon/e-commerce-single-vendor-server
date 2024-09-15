import {} from '';
export interface ICustomer {
  ec_id: number;
  ec_name: string;
  ec_phone: string;
  ec_email: string;
  ec_image: string;
  ec_status: number;
  type: string;
}
export interface IAdmin {
  au_id: number;
  au_name: string;
  au_phone: string;
  au_email: string;
  au_photo: string;
  role_name: string;
  au_status: number;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      user: IAdmin;
      customer: ICustomer;
      upFiles: {
        filename: string;
        folder: string;
      }[];
    }
  }
}
