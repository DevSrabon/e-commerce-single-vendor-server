import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminAuditTrailService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get all audit trail by admin or all service
  public async getAllAuditTrailByAdminOrAllService(req: Request) {
    const { limit, skip, from_date, to_date } = req.query;
    const { id } = req.params;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const data = await this.db('audit_trail AS at')
      .select(
        'at.at_id',
        'at.at_details',
        'at.at_status',
        'at.at_admin_id',
        'at.at_created_at',
        'au.au_name',
        'au.au_photo'
      )
      .join('admin_user AS au', 'at.at_admin_id', 'au.au_id')
      .where(function () {
        if (id !== 'all') {
          this.where({ at_admin_id: id });
        }
        if (from_date && to_date) {
          this.whereBetween('at_created_at', [from_date as string, endDate]);
        }
      })
      .offset(parseInt(skip as string))
      .limit(parseInt(limit as string));

    const total = await this.db('audit_trail')
      .count('at_id as total')
      .where(function () {
        if (id !== 'all') {
          this.where({ at_admin_id: id });
        }

        if (from_date && to_date) {
          this.whereBetween('at_created_at', [from_date as string, endDate]);
        }
      });

    return {
      success: true,
      data,
      total: total[0].total,
    };
  }
}

export default AdminAuditTrailService;
