export interface IaccountTransactionData {
  ac_tr_id: number;
  ac_tr_type: string;
  ac_tr_amount: number;
  ac_tr_details: string;
  ac_tr_date: Date;
  ac_tr_remark: string;
}

export interface IsingleAccountData {
  ac_id: number;
  ac_name: string;
  ac_type: string;
  ac_number: number;
  ac_bank_name: string;
  ac_bank_branch: string;
  ac_details: string;
  ac_created_at: Date;
  w_id: number;
  w_name: string;
  w_phone: string;
  w_email: string;

  acc_transaction: IaccountTransactionData[];
}
