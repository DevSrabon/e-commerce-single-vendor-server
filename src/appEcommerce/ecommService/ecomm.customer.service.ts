import { Request } from 'express';
import EcommAbstractServices from '../ecommAbstracts/ecomm.abstract.service';
import { IAddressUpdateBodyType } from '../ecommUtils/ecommTypes/ecommAddressTypes';
import Lib from '../../utils/lib/lib';

class EcommCustomerService extends EcommAbstractServices {
  constructor() {
    super();
  }

  // get customer profile
  public async getCustomerProfile(email: string) {
    const customer = await this.commonService.commonCheckCustomer(email);
    if (!customer.length) {
      return {
        success: false,
        message: 'Not found',
      };
    }
    const { ec_password, ec_status, ...rest } = customer[0];
    const address = await this.db('ec_shipping_address as esa')
      .select(
        'esa.ecsa_id as id',
        'esa.ecsa_label as label',
        'esa.ecsa_name as name',
        'esa.ecsa_phone as phone',
        'esa.ecsa_address as address',
        'esa.ecsa_landmark as landmark',
        'av.area_id',
        'av.area_name',
        'av.sub_city_id',
        'av.sub_city_name',
        'av.city_id',
        'av.city_name',
        'av.province_id',
        'av.province_name'
      )
      .join('address_view as av', 'esa.ecsa_ar_id', 'av.area_id')
      .andWhere('ecsa_ec_id', rest.ec_id)
      .andWhere('ecsa_status', 1)
      .orderBy('ecsa_created_at', 'desc');

    return {
      success: true,
      data: { ...rest, address },
    };
  }

  //customer change password
  public async changePasswordCustomer(
    email: string,
    oldPass: string,
    newPass: string
  ) {
    const [customer] = await this.commonService.commonCheckCustomer(email);
    const verifyOldPass = await Lib.compare(oldPass, customer.ec_password);

    if (!verifyOldPass) {
      return {
        success: false,
        message: "Old password doesn't match",
      };
    }

    const hashedPass = await Lib.hashPass(newPass);

    await this.db('e_customer').update({
      ec_password: hashedPass,
    });

    return {
      success: true,
      message: 'Password changed successful',
    };
  }

  // update customer profile
  public async updateCustomerProfile(req: Request) {
    const { ec_id } = req.customer;
    const { ec_phone } = req.body;

    const checkCustomer = await this.db('e_customer')
      .select('ec_image')
      .where({ ec_id });

    const body: { ec_image?: string; ec_phone: string } = { ec_phone };
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) {
      body['ec_image'] = files[0].filename;
    }

    const res = await this.db('e_customer').update(body).where({ ec_id });

    if (res) {
      if (files.length && checkCustomer[0].ec_image) {
        this.manageFile.deleteFromStorage([
          { filename: checkCustomer[0].ec_image, folder: 'ecommerce/customer' },
        ]);
      }

      return {
        success: true,
        data: body,
        message: 'Profile updated',
      };
    } else {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // create shipping address
  public async createShippingAddress(req: Request) {
    const { label, name, phone, address, landmark, ar_id } = req.body;
    const { ec_id } = req.customer;
    const res = await this.db('ec_shipping_address').insert({
      ecsa_ec_id: ec_id,
      ecsa_label: label,
      ecsa_name: name,
      ecsa_phone: phone,
      ecsa_address: address,
      ecsa_landmark: landmark,
      ecsa_ar_id: ar_id,
    });

    if (res.length) {
      return {
        success: true,
        message: 'Shipping address created',
        data: {
          ecsa_id: res[0],
        },
      };
    } else {
      return {
        success: false,
        message: 'Cannot create shipping address now',
      };
    }
  }

  // get shipping address
  public async getShippingAddress(customer_id: number) {
    const data = await this.db('ec_shipping_address')
      .select(
        'ecsa_id',
        'ecsa_label',
        'ecsa_name',
        'ecsa_phone',
        'ecsa_address',
        'ecsa_landmark'
      )
      .andWhere('ecsa_ec_id', customer_id)
      .andWhere('ecsa_status', 1)
      .orderBy('ecsa_created_at', 'desc');

    return {
      success: true,
      data,
    };
  }

  // update shipping address
  public async updateShippingAddress(
    address_id: string,
    body: IAddressUpdateBodyType
  ) {
    const res = await this.db('ec_shipping_address')
      .update(body)
      .where('ecsa_id', address_id);

    if (res) {
      return {
        success: true,
        message: 'Shipping address updated',
      };
    } else {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }
}

export default EcommCustomerService;
