import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';
import { callSingleParamStoredProcedure } from '../../utils/procedure/common-procedure';

class AdminWareHouseService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create a warehouse
  public async createWarehouseService(req: Request) {
    const { w_name } = req.body;
    const checkWarehouse = await this.db('warehouse')
      .select('w_name')
      .where({ w_name });

    if (checkWarehouse.length) {
      return {
        success: false,
        message: 'Already have warehouse with this name',
      };
    }

    const res = await this.db('warehouse').insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: 'warehouse has been created',
      };
    } else {
      return {
        success: false,
        message: 'Cannot create warehouse',
      };
    }
  }

  // get all warehouse
  public async getAllWarehouseService(req: Request) {
    const {
      w_name,
      city,
      sub_city,
      area,
      limit,
      province_id,
      skip,
      order_by = 'w_id',
      according_order = 'asc',
    } = req.query;

    const dtbs = this.db('warehouse AS w');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        'w.w_id',
        'w.w_name',
        'w.w_address',
        'av.area_name',
        'av.sub_city_name',
        'av.city_name',
        'av.province_name'
      )
      .leftJoin('address_view AS av', 'w.w_ar_id', 'av.area_id')

      .where(function () {
        if (area) {
          this.andWhere('w.w_ar_id', area);
        }
        if (city) {
          this.andWhere('av.city_id', city);
        }
        if (sub_city) {
          this.andWhere('av.sub_city_id', sub_city);
        }
        if (province_id) {
          this.andWhere('av.province_id', province_id);
        }
        if (w_name) {
          this.andWhere('w_name', 'Like', `%${w_name}%`);
        }
      })
      .orderBy(order_by as string, according_order as string);

    const count = await this.db('warehouse')
      .count('w_id AS total')
      .join('area', 'warehouse.w_ar_id', 'area.ar_id')
      .join('sub_city AS sc', 'area.ar_scit_id', 'sc.scit_id')
      .join('city AS c', 'sc.scit_cit_id', 'c.cit_id')
      .where(function () {
        if (area) {
          this.andWhere('w_ar_id', area);
        }
        if (city) {
          this.andWhere('cit_id', city);
        }
        if (sub_city) {
          this.andWhere('scit_id', sub_city);
        }
        if (w_name) {
          this.andWhere('w_name', 'Like', `%${w_name}%`);
        }
      });

    return {
      success: true,
      data,
      total: count[0].total,
    };
  }

  // get single warehouse
  public async getSingleWarehouseService(req: Request) {
    const { id } = req.params;

    const warehouseInfo = await callSingleParamStoredProcedure(
      'getSingleWarehouse',
      parseInt(id)
    );

    const products = await this.db('inventory_view AS iv')
      .select(
        'iv.i_p_id AS p_id',
        'pv.p_name',
        'pv.p_status',
        'iv.i_quantity_available AS quantity_available',
        'iv.i_quantity_sold AS quantity_sold',
        'iv.inventory_attribute'
      )
      .leftJoin('product_view AS pv', 'iv.i_p_id', 'pv.p_id')
      .where('iv.i_w_id', id);

    if (warehouseInfo.length) {
      return {
        success: true,
        data: {
          warehouseInfo: warehouseInfo[0],
          products,
        },
      };
    } else {
      return {
        success: false,
        message: 'No warehouse found with this id',
      };
    }
  }

  // update single warehouse
  public async updateWarehouseService(req: Request) {
    const { id } = req.params;
    const checkWarehouse = await this.db('warehouse')
      .select('w_id')
      .where({ w_id: id });

    if (!checkWarehouse.length) {
      return {
        success: false,
        message: 'Warehouse not found with this id',
      };
    }

    const res = await this.db('warehouse').update(req.body).where({ w_id: id });

    if (res) {
      return {
        success: true,
        data: 'Warehouse updated successfully',
      };
    } else {
      return {
        success: false,
        message: 'Warehouse update staff',
      };
    }
  }
}

export default AdminWareHouseService;
