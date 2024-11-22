import { Request } from "express";
import AdminAbstractServices from "../adminAbstracts/admin.abstract.service";

class AdminEcommerceQuestionService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce question
  public async getAllEquestionService(req: Request) {
    const { from_date, to_date, limit, status, skip, question, answer } =
      req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("ep_qna AS qna");

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "epq_id",
        "epq_ep_id",
        "epv.p_name_en",
        "epv.p_name_ar",
        "epq_question",
        "epq_question_date",
        "epq_ec_id",
        "epq_ec_id",
        "ec_name",
        "ec_image",
        "epq_status"
      )
      .join("product_view AS epv", "qna.epq_ep_id", "epv.p_id")
      .join("e_customer AS ec", "qna.epq_ec_id", "ec.ec_id")
      .where(function () {
        if (status) {
          this.andWhere("qna.epq_status", status);
        }
        if (from_date && to_date) {
          this.andWhereBetween("qna.epq_question_date", [
            from_date as string,
            endDate,
          ]);
        }
        if (question) {
          this.andWhere("epq_answer", null);
        }
        if (answer) {
          this.andWhereNot("epq_answer", null);
        }
      })
      .orderBy("epq_id", "desc");

    const count = await this.db("ep_qna AS qna")
      .count("qna.epq_id AS total")
      .join("product_view AS epv", "qna.epq_ep_id", "epv.p_id")
      .join("e_customer AS ec", "qna.epq_ec_id", "ec.ec_id")
      .where(function () {
        if (status) {
          this.andWhere("qna.epq_status", status);
        }
        if (from_date && to_date) {
          this.andWhereBetween("qna.epq_question_date", [
            from_date as string,
            endDate,
          ]);
        }

        if (question) {
          this.andWhere("epq_answer", null);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  //get single ecommerce question
  public async getSingleEquestionService(req: Request) {
    const { id } = req.params;

    const data = await this.db("ep_qna AS qna")
      .select(
        "epq_id",
        "epq_ep_id",
        "epv.p_name_en",
        "epv.p_name_ar",
        "p_images",
        "epq_question",
        "epq_question_date",
        "epq_answer",
        "epq_answer_date",
        "epq_au_id",
        "epq_ec_id",
        "epq_ec_id",
        "ec_name",
        "ec_image",
        "epq_status"
      )
      .join("product_view AS epv", "qna.epq_ep_id", "epv.p_id")
      .join("e_customer AS ec", "qna.epq_ec_id", "ec.ec_id")
      .where("qna.epq_id", id);

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: "Question doesnot found with this id",
      };
    }
  }

  // update single e question
  public async updateSingleEquestionService(req: Request) {
    const { qId } = req.params;
    const { type } = req.query;
    const { status, epq_answer } = req.body;

    const data = await this.db("ep_qna AS qna")
      .select("epq_id")
      .join("product_view AS epv", "qna.epq_ep_id", "epv.p_id")
      .where("qna.epq_id", qId);

    if (!data.length) {
      return {
        success: false,
        message: "Question does not found with this id",
      };
    }

    if (type === "reply") {
      const nowTime = new Date();

      const replyRes = await this.db("ep_qna")
        .update({
          epq_answer,
          epq_answer_date: nowTime,
        })
        .where({ epq_id: qId });

      if (replyRes) {
        return {
          success: true,
          message: "Successfully replied",
        };
      } else {
        return {
          success: false,
          message: "Cannot reply of this question right now ",
        };
      }
    } else {
      const updateRes = await this.db("ep_qna")
        .update({
          epq_status: status,
        })
        .where({ epq_id: qId });

      if (updateRes) {
        return {
          success: true,
          message: "Successfully status updated",
        };
      } else {
        return {
          success: false,
          message: "Cannot status update of this question right now ",
        };
      }
    }
  }
}

export default AdminEcommerceQuestionService;
