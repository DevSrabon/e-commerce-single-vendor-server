import { Request } from "express";
import CustomError from "../../../utils/lib/customError";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";
class AdminAccountsService extends AdminAbstractServices {
  constructor() {
    super();
  }
  // create a account
  public async createAccountService(req: Request) {
    const body = req.body as {
      ac_w_id: number;
      ac_name: string;
      ac_type: string;
      ac_number: string;
      ac_bank_name: string;
      ac_bank_branch: string;
      ac_details: string;
      ac_opening_balance?: number;
    };
    const { au_id } = req.user;
    return await this.db.transaction(async (trx) => {
      const checkStore = await trx("warehouse")
        .select("w_id")
        .where("w_id", body.ac_w_id);
      if (!checkStore.length) {
        throw new CustomError("Store Not Found", 404, "Not Found");
      }
      if (body.ac_number) {
        const checkAcc = await trx("accounts")
          .select("ac_id")
          .where("ac_number", body.ac_number);

        if (checkAcc.length) {
          return {
            success: false,
            message: "Account no already exists",
          };
        }
      }

      const res = await trx("accounts").insert(req.body);

      if (body.ac_opening_balance) {
        await trx("account_ledger").insert({
          account_id: res[0],
          amount: body.ac_opening_balance,
          created_by: au_id,
          details: `Payment received from opening balance amount /- ${body.ac_opening_balance}`,
          ledger_date: new Date(),
          tr_type: "Opening Balance",
          type: "IN",
        });
      }
      if (res.length) {
        await this.createAuditTrail({
          at_admin_id: au_id,
          at_details: "Account has been created with name " + body.ac_name,
        });
        return {
          success: true,
          message: "Account has been created",
        };
      } else {
        return {
          success: false,
          message: "Cannot create account",
        };
      }
    });
  }
  // get all account
  public async getAllaccountService(req: Request) {
    const {
      ac_name,
      limit,
      skip,
      order_by = "ac_name",
      according_order = "asc",
    } = req.query;

    const dtbs = this.db("accounts AS ac");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "ac.ac_id",
        "ac.ac_name",
        "w.w_id",
        "w.w_name",
        "ac.ac_type",
        "ac.ac_bank_name",
        this.db.raw(
          `(SELECT SUM(CASE WHEN al.type = ? THEN al.amount ELSE 0 END) - SUM(CASE WHEN al.type = ? THEN al.amount ELSE 0 END) as balance FROM account_ledger al where al.account_id = ac.ac_id) as balance`,
          ["IN", "OUT"]
        )
      )
      .join("warehouse AS w", "ac.ac_w_id", "w.w_id")
      .where(function () {
        if (ac_name) {
          this.where("ac_name", "like", `%${ac_name}%`);
        }
      })
      .orderBy(order_by as string, according_order as string);
    console.log({ data });
    return {
      success: true,
      data,
    };
  }

  // get single account
  public async getSingleAccountService(req: Request) {
    const { id } = req.params;
    const data = await this.db("accounts AS ac")
      .select(
        "ac.ac_id",
        "ac.ac_name",
        "ac.ac_type",
        "ac.ac_number",
        "ac.ac_bank_name",
        "ac.ac_bank_branch",
        "ac.ac_details",
        "ac.ac_created_at",
        this.db.raw(
          `(SELECT SUM(CASE WHEN al.type = ? THEN al.amount ELSE 0 END) - SUM(CASE WHEN al.type = ? THEN al.amount ELSE 0 END) as balance FROM account_ledger al where al.account_id = ac.ac_id) as balance`,
          ["IN", "OUT"]
        ),
        "w.w_id",
        "w.w_name",
        "w.w_phone",
        "w.w_email"
      )
      .join("warehouse As w", "ac.ac_w_id", "w.w_id")
      .where("ac.ac_id", id);

    if (data.length) {
      const accountLeger = await this.db("account_ledger")
        .select("*")
        .where({ account_id: id });
      return {
        success: true,
        data: { ...data[0], accountLeger },
      };
    } else {
      return {
        success: false,
        message: "Account not found with this id",
      };
    }
  }

  // update single account
  public async updateSingleAccountService(req: Request) {
    const { id } = req.params;
    const checkAcc = await this.db("accounts")
      .select("ac_id")
      .where({ ac_id: id });

    if (!checkAcc.length) {
      return {
        success: false,
        message: "Account not found with this id",
      };
    }

    const res = await this.db("accounts").update(req.body).where({ ac_id: id });

    if (res) {
      return {
        success: true,
        message: "Account has been updated",
      };
    } else {
      return {
        success: false,
        message: "Cannot update this account",
      };
    }
  }

  // get all transaction
  public async getAllTransactionService(req: Request) {
    const {
      ac_name,
      ac_tr_type,
      account_id,
      from_date,
      to_date,
      limit,
      skip,
      order_by = "ac_name",
      according_order = "asc",
    } = req.query;

    let endDate: any = new Date(to_date as string);

    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("account_ledger AS al");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "ac.ac_id",
        "ac.ac_name",
        "w.w_id",
        "w.w_name",
        "al.type",
        "al.voucher_no",
        "al.details",
        "al.amount",
        "al.tr_type",
        "al.ledger_date",
        "al.payment_method"
      )
      .join("accounts AS ac", "al.account_id", "ac.ac_id")
      .join("warehouse AS w", "ac.ac_w_id", "w.w_id")
      .where(function () {
        if (account_id) {
          this.andWhere("ac.ac_id", account_id);
        }
        if (ac_name) {
          this.where("ac.ac_name", "like", `%${ac_name}%`);
        }
        if (ac_tr_type) {
          this.where("al.type", ac_tr_type);
        }
        if (from_date && to_date) {
          this.whereBetween("al.ledger_date", [from_date as string, endDate]);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const total = await this.db("account_ledger as al")
      .count("ac.ac_id as total")
      .join("accounts AS ac", "al.account_id", "ac.ac_id")
      .join("warehouse AS w", "ac.ac_w_id", "w.w_id")
      .where(function () {
        if (account_id) {
          this.andWhere("ac.ac_id", account_id);
        }
        if (ac_name) {
          this.where("ac.ac_name", "like", `%${ac_name}%`);
        }
        if (ac_tr_type) {
          this.where("al.type", ac_tr_type);
        }
        if (from_date && to_date) {
          this.whereBetween("al.ledger_date", [from_date as string, endDate]);
        }
      });

    return {
      success: true,
      data,
      total: total[0].total,
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
      order_by = "acc_ledger_id",
      according_order = "asc",
    } = req.query;

    let endDate: any = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("acc_ledger AS al");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "al.acc_ledger_id",
        "al.acc_ledger_account_id",
        "ac.ac_name",
        "ac.ac_bank_name",
        "ac.ac_type AS transaction_type",
        "al.acc_ledger_debit_amount",
        "al.acc_ledger_credit_amount",
        "al.acc_ledger_balance",
        "al.acc_ledger_details",
        "acc_transacation_date"
      )
      .join("accounts AS ac", "al.acc_ledger_account_id", "ac.ac_id")
      .where(function () {
        this.andWhere("al.acc_ledger_account_id", account_id);
        if (from_date && to_date) {
          this.whereBetween("al.acc_transacation_date", [
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
