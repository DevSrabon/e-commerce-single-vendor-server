import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminEcommerceReviewService extends AdminAbstractServices {
  constructor() {
    super();
  }

  //get all ecommerce review
  public async getAllEreviewService(req: Request) {
    const { from_date, to_date, limit, skip, status } = req.query;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('e_product_review AS epr');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
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
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('epr.epr_created_at', [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere('epr.epr_status', status);
        }
      })
      .orderBy('epr_id', 'desc');

    const count = await this.db('e_product_review AS epr')
      .count('epr.epr_id AS total')
      .join('e_product_view AS epv', 'epr.epr_ep_id', 'epv.ep_id')
      .join('e_customer AS ec', 'epr.epr_ec_id', 'ec.ec_id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('epr.epr_created_at', [
            from_date as string,
            endDate,
          ]);
        }
        if (status) {
          this.andWhere('epr.epr_status', status);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  //get single ecommerce review
  public async getSingleEreviewService(req: Request) {
    const { id } = req.params;

    const data = await this.db('e_product_review AS epr')
      .select(
        'epr_id',
        'epr_ec_id',
        'ec_name',
        'ec_image',
        'ep_id',
        'p_name',
        'epr_rating',
        'epr_comment',
        'epri_image',
        'epr_status',
        'epr_created_at'
      )
      .join('e_product_view AS epv', 'epr.epr_ep_id', 'epv.ep_id')
      .join('e_customer AS ec', 'epr.epr_ec_id', 'ec.ec_id')
      .leftJoin('epr_image AS epri', 'epr.epr_id', 'epri.epri_epr_id')
      .where('epr.epr_id', id);

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: 'Review doesnot found with this id',
      };
    }
  }
}

export default AdminEcommerceReviewService;
