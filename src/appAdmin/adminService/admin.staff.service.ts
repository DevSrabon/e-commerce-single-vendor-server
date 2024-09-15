import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminStaffService extends AdminAbstractServices {
  constructor() {
    super();
  }
  // create a staff
  public async createStaffService(req: Request) {
    const { st_email } = req.body;
    const checkStaff = await this.db('staff')
      .select('st_email')
      .where({ st_email });

    if (checkStaff.length) {
      return {
        success: false,
        message: 'Already have staff with this email',
      };
    }
    const files = (req.files as Express.Multer.File[]) || [];

    req.body[files[0]?.fieldname] = files[0]?.filename;

    const res = await this.db('staff').insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: 'Staff has been created',
      };
    } else {
      return {
        success: false,
        message: 'Cannot create staff',
      };
    }
  }

  // get all staff
  public async getAllStuffService(req: Request) {
    const {
      status,
      st_name,
      warehouse_id,
      limit,
      skip,
      order_by = 'st_name',
      according_order = 'asc',
    } = req.query;

    const dtbs = this.db('staff');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const staffData = await dtbs
      .select(
        'st_id',
        'st_name',
        'st_image',
        'st_status',
        'w.w_id',
        'w.w_name',
        'av.area_name',
        'av.sub_city_name',
        'av.city_name'
      )
      .leftJoin('address_view AS av', 'staff.st_ar_id', 'av.area_id')
      .leftJoin('warehouse AS w', 'staff.st_w_id', 'w.w_id')
      .where(function () {
        if (status) {
          this.andWhere('st_status', status);
        }
        if (st_name) {
          this.andWhere('st_name', 'Like', `%${st_name}%`);
        }
        if (warehouse_id) {
          this.andWhere('st_w_id', warehouse_id);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = await this.db('staff')
      .count('st_id AS total')
      .where(function () {
        if (status) {
          this.where('st_status', status);
        }
        if (st_name) {
          this.andWhere('st_name', 'Like', `%${st_name}%`);
        }
        if (warehouse_id) {
          this.andWhere('st_w_id', warehouse_id);
        }
      });

    return {
      success: true,
      total: count[0].total,
      data: staffData,
    };
  }

  // get single staff
  public async getSingleStaffService(req: Request) {
    const { id } = req.params;

    const data = await this.db('staff')
      .select(
        'st_id',
        'st_name',
        'st_image',
        'st_email',
        'st_address',
        'st_status',
        'st_phone',
        'st_ar_id',
        'av.area_name',
        'av.sub_city_name',
        'av.city_name',
        'av.province_name'
      )
      .leftJoin('address_view AS av', 'staff.st_ar_id', 'av.area_id')
      .where({ st_id: id });

    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: 'No staff found with this id',
      };
    }
  }

  // update single staff
  public async updateStaffService(req: Request) {
    const { id } = req.params;
    const checkStaff = await this.db('staff')
      .select('st_id')
      .where('st_id', id);

    if (!checkStaff.length) {
      return {
        success: false,
        message: 'Staff not found with this id',
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    req.body[files[0]?.fieldname] = files[0]?.filename;

    const res = await this.db('staff').update(req.body).where('st_id', id);

    if (res) {
      return {
        success: true,
        data: 'Staff updated successfully',
      };
    } else {
      return {
        success: false,
        message: 'Cannot update staff',
      };
    }
  }

  // delete staff
  public async deleteStaffService(req: Request) {
    const { id } = req.params;

    const res = await this.db('staff').where({ st_id: id }).del();

    if (res) {
      return {
        success: true,
        data: 'Staff deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Cannot delete staff',
      };
    }
  }
}

export default AdminStaffService;
