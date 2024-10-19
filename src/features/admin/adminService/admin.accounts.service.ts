import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';
import { IsingleAccountData } from '../utils/types/accountTypes';
import http from 'http';
import https from 'https';
import fs from 'fs';
class AdminAccountsService extends AdminAbstractServices {
  constructor() {
    super();
  }
  // create a account
  public async createAccountService(req: Request) {
    const res = await this.db('accounts').insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: 'Account has been created',
      };
    } else {
      return {
        success: false,
        message: 'Cannot create account',
      };
    }
  }
  // get all account
  public async getAllaccountService(req: Request) {
    const {
      ac_name,
      limit,
      skip,
      order_by = 'ac_name',
      according_order = 'asc',
    } = req.query;

    const dtbs = this.db('accounts AS ac');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        'ac.ac_id',
        'ac.ac_name',
        'w.w_id',
        'w.w_name',
        'ac.ac_type',
        'ac.ac_bank_name'
      )
      .join('warehouse AS w', 'ac.ac_w_id', 'w.w_id')
      .where(function () {
        if (ac_name) {
          this.where('ac_name', 'like', `%${ac_name}%`);
        }
      })
      .orderBy(order_by as string, according_order as string);

    return {
      success: true,
      data,
    };
  }

  // get single account
  public async getSingleAccountService(req: Request) {
    const { id } = req.params;
    const data = await this.db('accounts AS ac')
      .select(
        'ac.ac_id',
        'ac.ac_name',
        'ac.ac_type',
        'ac.ac_number',
        'ac.ac_bank_name',
        'ac.ac_bank_branch',
        'ac.ac_details',
        'ac.ac_created_at',
        'w.w_id',
        'w.w_name',
        'w.w_phone',
        'w.w_email',
        'at.ac_tr_id',
        'at.ac_tr_type',
        'at.ac_tr_amount',
        'at.ac_tr_date'
      )
      .join('warehouse As w', 'ac.ac_w_id', 'w.w_id')
      .leftJoin('ac_transaction AS at', 'ac.ac_id', 'at.ac_tr_ac_id')
      .where('ac.ac_id', id);

    let data2: IsingleAccountData[] = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;

      for (let j = 0; j < data2.length; j++) {
        if (data[i].ac_id === data2[j].ac_id) {
          found = true;
          data2[j].acc_transaction.push({
            ac_tr_id: data[i].ac_tr_id,
            ac_tr_type: data[i].ac_tr_type,
            ac_tr_amount: data[i].ac_tr_amount,
            ac_tr_details: data[i].ac_tr_details,
            ac_tr_date: data[i].ac_tr_date,
            ac_tr_remark: data[i].ac_tr_remark,
          });
        }
      }

      if (!found) {
        data2.push({
          ac_id: data[i].ac_id,
          ac_name: data[i].ac_name,
          ac_type: data[i].ac_type,
          ac_number: data[i].ac_number,
          ac_bank_name: data[i].ac_bank_name,
          ac_bank_branch: data[i].ac_bank_branch,
          ac_details: data[i].ac_details,
          ac_created_at: data[i].ac_created_at,
          w_id: data[i].w_id,
          w_name: data[i].w_name,
          w_phone: data[i].w_phone,
          w_email: data[i].w_email,
          acc_transaction: [
            {
              ac_tr_id: data[i].ac_tr_id,
              ac_tr_type: data[i].ac_tr_type,
              ac_tr_amount: data[i].ac_tr_amount,
              ac_tr_details: data[i].ac_tr_details,
              ac_tr_date: data[i].ac_tr_date,
              ac_tr_remark: data[i].ac_tr_remark,
            },
          ],
        });
      }
    }

    if (data.length) {
      return {
        success: true,
        data: data2[0],
      };
    } else {
      return {
        success: false,
        message: 'Account not found with this id',
      };
    }
  }

  // update single account
  public async updateSingleAccountService(req: Request) {
    const { id } = req.params;
    const checkAcc = await this.db('accounts')
      .select('ac_id')
      .where({ ac_id: id });

    if (!checkAcc.length) {
      return {
        success: false,
        message: 'Account not found with this id',
      };
    }

    const res = await this.db('accounts').update(req.body).where({ ac_id: id });

    if (res) {
      return {
        success: true,
        message: 'Account has been updated',
      };
    } else {
      return {
        success: false,
        message: 'Cannot update this account',
      };
    }
  }

  // get all transaction
  public async getAllTransactionService(req: Request) {
    const {
      ac_name,
      ac_tr_type,
      from_date,
      to_date,
      limit,
      skip,
      order_by = 'ac_name',
      according_order = 'asc',
    } = req.query;

    let endDate: any = new Date(to_date as string);

    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('ac_transaction AS at');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    console.log(from_date, endDate);

    const data = await dtbs
      .select(
        'ac.ac_id',
        'ac.ac_name',
        'w.w_id',
        'w.w_name',
        'at.ac_tr_type',
        'at.ac_tr_amount',
        'at.ac_tr_date'
      )
      .join('accounts AS ac', 'at.ac_tr_ac_id', 'ac.ac_id')
      .join('warehouse AS w', 'ac.ac_w_id', 'w.w_id')
      .where(function () {
        if (ac_name) {
          this.where('ac.ac_name', 'like', `%${ac_name}%`);
        }
        if (ac_tr_type) {
          this.where('at.ac_tr_type', ac_tr_type);
        }
        if (from_date && to_date) {
          this.whereBetween('at.ac_tr_date', [from_date as string, endDate]);
        }
      })
      .orderBy(order_by as string, according_order as string);

    return {
      success: true,
      data,
    };
  }

  // get account ledger by account
  public async getAllLedgerByAccountService(req: Request) {
    const {
      from_date,
      to_date,
      limit,
      skip,
      account_id,
      order_by = 'acc_ledger_id',
      according_order = 'asc',
    } = req.query;

    let endDate: any = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('acc_ledger AS al');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        'al.acc_ledger_id',
        'al.acc_ledger_account_id',
        'ac.ac_name',
        'ac.ac_bank_name',
        'ac.ac_type AS transaction_type',
        'al.acc_ledger_debit_amount',
        'al.acc_ledger_credit_amount',
        'al.acc_ledger_balance',
        'al.acc_ledger_details',
        'acc_transacation_date'
      )
      .join('accounts AS ac', 'al.acc_ledger_account_id', 'ac.ac_id')
      .where(function () {
        this.andWhere('al.acc_ledger_account_id', account_id);
        if (from_date && to_date) {
          this.whereBetween('al.acc_transacation_date', [
            from_date as string,
            endDate,
          ]);
        }
      })
      .orderBy(order_by as string, according_order as string);

    return {
      success: true,
      data,
    };
  }
}

export default AdminAccountsService;

// const headers = {
//   'Content-Type': 'application/json',
//   Authorization: 'Bearer your_access_token',
// };
// const meImg = axios.get(
//   'https://onthewayserver.azurewebsites.net/api/v1/me',
//   {
//     headers,
//   }
// );

// console.log(meImg);

// let newImg: any[] = [];

// meImg.map((member: any) => {
//   newImg.push(member.user_member_representative_photo);
// });

// newImg.map((img) => {
//   const imageUrl = `https://pksfdigital.blob.core.windows.net/me-database/uploads/me_files/${img}`; // Replace with the desired image URL
//   const destination = `./dist/allMeImgs/${img}`; // Replace with the desired destination path and file name

//   // Determine whether to use the 'http' or 'https' module based on the URL
//   const client = imageUrl.startsWith('https') ? https : http;

//   const file = fs.createWriteStream(destination);

//   client
//     .get(imageUrl, (response) => {
//       response.pipe(file);
//       file.on('finish', () => {
//         file.close();
//         console.log('Image downloaded successfully.');
//       });
//     })
//     .on('error', (err) => {
//       fs.unlink(destination, () => {}); // Delete the file if there is an error
//       console.error('Error downloading the image:', err.message);
//     });
// });
