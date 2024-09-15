import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminEcustomerService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce customer
  public async getAllEcustomerService(req: Request) {
    const { from_date, to_date, limit, skip, status, search } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('e_customer AS ec');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        'ec_id',
        'ec_name',
        'ec_phone',
        'ec_email',
        'ec_image',
        'ec_status'
      )
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('ec.ec_created_at', [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere('ec.ec_status', status);
        }
        if (search) {
          this.orWhere('ec.ec_name', 'Like', `%${search}%`);
          this.orWhere('ec.ec_phone', 'Like', `%${search}%`);
          this.orWhere('ec.ec_email', 'Like', `%${search}%`);
        }
      })
      .orderBy('ec_id', 'desc');

    const count = await this.db('e_customer AS ec')
      .count('ec.ec_id AS total')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('ec.ec_created_at', [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere('ec.ec_status', status);
        }
        if (search) {
          this.orWhere('ec.ec_name', 'Like', `%${search}%`);
          this.orWhere('ec.ec_phone', 'Like', `%${search}%`);
          this.orWhere('ec.ec_email', 'Like', `%${search}%`);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  //get single ecommerce customer
  public async getSingleEcustomerService(req: Request) {
    const { id } = req.params;

    const data = await this.db('e_customer AS ec')
      .select(
        'ec_id',
        'ec_name',
        'ec_phone',
        'ec_email',
        'ec_image',
        'ec_status'
      )
      .where('ec.ec_id', id);

    // all order by customer
    const orderData = await this.db('e_order AS eo')
      .select('eo_id', 'eo_status', 'eo_grand_total', 'eo.eo_created_at')
      .join('e_customer AS ec', 'eo.eo_ec_id', 'ec.ec_id')
      .join('ec_shipping_address AS esa', 'eo.eo_ecsa_id', 'esa.ecsa_id')
      .join('address_view AS av', 'esa.ecsa_ar_id', 'av.area_id')
      .where({ 'eo.eo_ec_id': id });

    // review by customer
    const review = await this.db('e_product_review AS epr')
      .select(
        'epr_id',
        'epr_ec_id',
        'ec_name',
        'ec_image',
        'ep_id',
        'p_name',
        'epr_rating',
        'epr_comment',
        'epr_status'
      )
      .join('e_product_view AS epv', 'epr.epr_ep_id', 'epv.ep_id')
      .join('e_customer AS ec', 'epr.epr_ec_id', 'ec.ec_id')
      .where('epr.epr_ec_id', id);

    // questions by customer

    const question = await this.db('ep_qna AS qna')
      .select(
        'epq_id',
        'epq_ep_id',
        'epv.p_name',
        'epq_question',
        'epq_question_date',
        'epq_ec_id',
        'epq_ec_id',
        'ec_name',
        'ec_image'
      )
      .join('e_product_view AS epv', 'qna.epq_ep_id', 'epv.ep_id')
      .join('e_customer AS ec', 'qna.epq_ec_id', 'ec.ec_id')
      .where('qna.epq_ec_id', id);

    if (data.length) {
      return {
        success: true,
        data: {
          ...data[0],
          orders: orderData,
          reviews: review,
          questions: question,
        },
      };
    } else {
      return {
        success: false,
        message: 'Review doesnot found with this id',
      };
    }
  }
}

export default AdminEcustomerService;
