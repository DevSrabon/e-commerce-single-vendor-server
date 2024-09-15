import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminAddressService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get all province
  public async getAllProvince(req: Request) {
    let data = [];

    data = await this.db('province').select(
      'pro_id',
      'pro_name_en',
      'pro_name_bn',
      'pro_c_id'
    );

    return {
      success: true,
      data,
    };
  }
  // get all cities by province or all
  public async getAllCitiesByProvince(req: Request) {
    const { province } = req.query;
    let data = [];

    if (province) {
      data = await this.db('city')
        .select('cit_id', 'cit_name_en', 'cit_name_bn')
        .where('cit_pro_id', province);
    } else {
      data = await this.db('city').select(
        'cit_id',
        'cit_name_en',
        'cit_name_bn'
      );
    }

    return {
      success: true,
      data,
    };
  }

  // get all sub city by city
  public async getAllSubCityByCity(req: Request) {
    const { city } = req.query;
    console.log({ city });
    const data = await this.db('sub_city')
      .select('scit_id', 'scit_name_en', 'scit_name_bn')
      .where('scit_cit_id', city);

    return {
      success: true,
      data,
    };
  }

  // create sub city
  public async createSubCity(req: Request) {
    const { name_en, name_bn, city_id } = req.body;

    const data = await this.db('sub_city').insert({
      scit_cit_id: city_id,
      scit_name_bn: name_bn,
      scit_name_en: name_en,
    });

    return {
      success: true,
      message: 'Sub city created!',
      data: {
        ar_id: data[0],
      },
    };
  }

  // get all area by sub city
  public async getAllAreaBySubCity(req: Request) {
    const { sub_city } = req.query;
    const data = await this.db('area')
      .select('ar_id', 'ar_name_bn', 'ar_name_en')
      .where('ar_scit_id', sub_city);

    return {
      success: true,
      data,
    };
  }

  // create area
  public async createArea(req: Request) {
    const { name_en, name_bn, sub_city_id } = req.body;

    const data = await this.db('area').insert({
      ar_scit_id: sub_city_id,
      ar_name_bn: name_bn,
      ar_name_en: name_en,
    });

    return {
      success: true,
      message: 'Area created!',
      data: {
        ar_id: data[0],
      },
    };
  }
}
export default AdminAddressService;
