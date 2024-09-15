import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminAttributeService extends AdminAbstractServices {
  constructor() {
    super();
  }
  // create a attribute
  public async createAttributeService(req: Request) {
    const { a_name } = req.body;
    const checkAttribute = await this.db('attribute')
      .select('a_id')
      .where({ a_name });

    if (checkAttribute.length) {
      return {
        success: false,
        message: 'Attribute name already exist',
      };
    }

    const res = await this.db('attribute').insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: 'Attribute has been created',
      };
    } else {
      return {
        success: false,
        message: 'Cannot create attribute',
      };
    }
  }
  // get all attribute
  public async getAllAttributeService(req: Request) {
    const {
      a_name,
      limit,
      skip,
      order_by = 'a_name',
      according_order = 'asc',
    } = req.query;

    const dtbs = this.db('attribute');

    if (limit) {
      dtbs.limit(parseInt(limit as string));
    }
    if (skip) {
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select('a_id', 'a_name')
      .where(function () {
        if (a_name) {
          this.where('attribute.a_name', 'like', `%${a_name}%`);
        }
      })
      .orderBy(order_by as string, according_order as string);

    return {
      success: true,
      data,
    };
  }
  // get single attribute
  public async getSingleAttributeService(req: Request) {
    const { id } = req.params;
    const data = await this.db('attribute AS ab')
      .select('a_id', 'a_name', 'a_created_at', 'av_value', 'av_id')
      .leftJoin('attribute_value AS av', 'ab.a_id', 'av.av_a_id')
      .where('ab.a_id', id);

    let data2: any[] = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;
      for (let j = 0; j < data2.length; j++) {
        if (data[i].a_id === data2[j].a_id) {
          found = true;
          data2[j].av_value.push({
            av_id: data[i].av_id,
            av_value: data[i].av_value,
          });
        }
      }

      if (!found) {
        data2.push({
          a_id: data[i].a_id,
          a_name: data[i].a_name,
          a_created_at: data[i].a_created_at,
          av_value: [{ av_id: data[i].av_id, av_value: data[i].av_value }],
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
        message: 'No attribute found with this id',
      };
    }
  }

  // update single attributes
  public async updateSingleAttributeService(id: number, req: Request) {
    const checkAttribute = await this.db('attribute')
      .select('a_id')
      .where('a_id', id);

    if (!checkAttribute.length) {
      return {
        success: false,
        message: 'Attribute not found with this id',
      };
    }

    const res = await this.db('attribute').update(req.body).where('a_id', id);

    if (res) {
      return {
        success: true,
        data: 'Attribute updated successfully',
      };
    } else {
      return {
        success: false,
        message: 'Cannot update attribute',
      };
    }
  }

  // delete single attributes
  public async deleteSingleAttributeService(id: number) {
    const checkAttributeValue = await this.db('attribute_value')
      .select('av_id')
      .where('av_a_id', id);

    if (checkAttributeValue.length) {
      return {
        success: false,
        message:
          'Already have attribute value by this id so you cannot delete this attribute',
      };
    }

    const res = await this.db('attribute').where({ a_id: id }).del();

    if (res) {
      return {
        success: true,
        data: 'Attribute deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Cannot delete attribute',
      };
    }
  }

  // create a attribute value
  public async createAttributeValueService(req: Request) {
    const { av_a_id } = req.body;

    const checkAttribute = await this.db('attribute')
      .select('a_name')
      .where('a_id', av_a_id);

    if (!checkAttribute.length) {
      return {
        success: false,
        message:
          'Attribute not found, so you cannot create attribute value with this id',
      };
    }

    const res = await this.db('attribute_value').insert(req.body);

    if (res.length) {
      return {
        success: true,
        message: 'Attribute value has been created',
      };
    } else {
      return {
        success: false,
        message: 'Cannot create attribute value',
      };
    }
  }
  // get all attribute value
  public async getAllAttributeValueService() {
    const data = await this.db('attribute_value AS av')
      .select('av.av_id', 'av.av_value', 'ab.a_name')
      .join('attribute AS ab', 'av.av_a_id', 'ab.a_id');
    return {
      success: true,
      data,
    };
  }

  // delete single attribute value
  public async deleteSingleAttributeValueService(id: number) {
    const checkAttributeValueinProudct = await this.db('product_attribute')
      .select('pa_p_id')
      .where('pa_av_id', id);

    if (checkAttributeValueinProudct.length) {
      return {
        success: false,
        message:
          'Already have attribute value in product so you cannot delete this attribute value',
      };
    }
    const res = await this.db('attribute_value').where({ av_id: id }).del();

    if (res) {
      return {
        success: true,
        data: 'Attribute value deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Cannot delete attribute value',
      };
    }
  }
}

export default AdminAttributeService;
