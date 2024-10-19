import { Request } from "express";
import EcommAbstractServices from "../ecommAbstracts/ecomm.abstract.service";

class EcommQnaService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // create a question of product service
  public async CreateQuestionService(req: Request) {
    const { ec_id } = req.customer;
    const { question, product_id } = req.body;
    const checkEp = await this.db("e_product")
      .select("*")
      .andWhere({ ep_id: product_id })
      .andWhere("ep_status", 1);

    if (!checkEp.length) {
      return {
        success: false,
        message: "Product not found!",
      };
    }

    const res = await this.db("ep_qna").insert({
      epq_ep_id: product_id,
      epq_ec_id: ec_id,
      epq_question: question,
    });

    return {
      success: true,
      message: "Question created successfully",
      data: {
        id: res[0],
      },
    };
  }

  // get qna of a product
  public async getQnaOfProductService(id: string | number) {
    const data = await this.db("ep_qna as epq")
      .select(
        "epq.epq_id as id",
        "epq.epq_ec_id as customer_id",
        "ec.ec_name as customer_name",
        "epq.epq_question as question",
        "epq.epq_question_date as question_date",
        "epq.epq_answer as answer",
        "epq.epq_answer_date as answer_date"
      )
      .join("e_customer as ec", "epq.epq_ec_id", "ec.ec_id")
      .andWhere("epq.epq_ep_id", id)
      .andWhere("epq.epq_status", 1);

    return {
      success: true,
      data,
    };
  }

  // get qna of customer
  public async getQnaOfCustomerService(id: number) {
    const data = await this.db("ep_qna as epq")
      .select(
        "epq.epq_id as id",
        "epv.p_name as product_name",
        "epv.p_images as product_images",
        "epv.p_slug as slug",
        "epq.epq_question as question",
        "epq.epq_question_date as question_date",
        "epq.epq_answer as answer",
        "epq.epq_answer_date as answer_date",
        "epq.epq_status as status"
      )
      .leftJoin("product_view as epv", "epq.epq_ep_id", "epv.ep_id")
      .andWhere("epq.epq_ec_id", id)
      .andWhere("epq.epq_status", 1);

    return {
      success: true,
      data,
    };
  }

  // delete qna
  public async deleteQnaService(id: string | number, ec_id: number) {
    const res = await this.db("ep_qna")
      .update({ epq_status: 0 })
      .andWhere("epq_id", id)
      .andWhere("epq_ec_id", ec_id);

    console.log({ res });

    if (res) {
      return {
        success: true,
        message: "Question deleted successfully",
      };
    } else {
      return {
        success: false,
        message: "Invalid Qna",
      };
    }
  }
}
export default EcommQnaService;
