import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';
import {
  IUpdateInventoryProduct,
  IaddInventoryProduct,
  IaddProductIntoInventory,
  IgetProductTpAttb,
  IgetPtProduct,
  IgetTransferProduct,
  IgetTransferProductInventoryAtbb,
  IptAttribute,
  IptProductInput,
  IptpAttributeVal,
  IremoveInventoryProduct,
  IremoveProductFromInventory,
  ItransferProductRequest,
} from '../utils/types/productTypes';
import {
  IaddAttributeValIntoInventoryAttribute,
  IremoveAttributeValIntoInventoryAttribute,
} from '../utils/types/inventoryTypes';
import { customRequest } from '../utils/types/combinedTypes';
import { callSingleParamStoredProcedure } from '../../utils/procedure/common-procedure';

class AdminTransferProductService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get all transfer product
  public async getAllTransferListService(req: Request) {
    const { warehouse_id, transfer_from, transfer_to, status } = req.query;
    const data = await this.db('p_transfer AS pt')
      .select(
        'w.w_id AS pt_from_w_id',
        'w2.w_id AS pt_to_w_id',
        'w.w_name As pt_from_w',
        'w2.w_name AS pt_to_w',
        'pt.pt_id',
        'pt.pt_send_date',
        'pt.pt_status'
      )
      .join('warehouse AS w', 'pt.pt_from_w_id', 'w.w_id')
      .join('warehouse As w2', 'pt.pt_to_w_id', 'w2.w_id')
      .where(function () {
        if (transfer_from) {
          this.andWhere('pt.pt_from_w_id', transfer_from);
        }
        if (transfer_to) {
          this.andWhere('pt.pt_to_w_id', transfer_to);
        }

        if (status) {
          this.andWhere('pt.pt_status', status);
        }
      })
      .orderBy('pt.pt_id', 'desc');
    return {
      success: true,
      data,
    };
  }

  // get a single transfer
  public async getSingleTransferService(req: Request) {
    const { id } = req.params;

    const transferInfo = await this.db('p_transfer AS pt')
      .select(
        'pt.pt_id',
        'pt.pt_send_date',
        'pt.pt_recieved_date',
        'pt.pt_status',
        'pt.pt_updated_by',
        'w.w_id AS pt_from_w_id',
        'w.w_name As pt_from_w',
        'w.w_address As pt_from_w_address',
        'w.w_phone As pt_from_w_phone',
        'w2.w_id AS pt_to_w_id',
        'w2.w_name AS pt_to_w',
        'w2.w_address As pt_to_w_address',
        'w2.w_phone As pt_to_w_phone'
      )
      .join('warehouse AS w', 'pt.pt_from_w_id', 'w.w_id')
      .join('warehouse As w2', 'pt.pt_to_w_id', 'w2.w_id')
      .where('pt.pt_id', id);

    const data = await callSingleParamStoredProcedure(
      'getSingleTransferInfo',
      parseInt(id)
    );

    return {
      success: true,
      data: {
        transferInfo: transferInfo[0],
        transfer_product: data,
      },
    };
  }

  // transfer product
  public async transferProductService(
    req: customRequest<ItransferProductRequest>
  ) {
    const { p_transfer, pt_product, ptp_attribute } = req.body;

    // checked warehouse
    const checkWarehouse = await this.db('warehouse')
      .select('w_name')
      .whereIn('w_id', [p_transfer.pt_from_w_id, p_transfer.pt_to_w_id]);

    if (checkWarehouse.length !== 2) {
      return {
        success: false,
        message: 'Warehouse does not found with this warehouse id',
      };
    }

    return await this.db.transaction(async (trx) => {
      // inserted product transfer table
      const ptRes = await trx('p_transfer').insert({
        pt_from_w_id: p_transfer.pt_from_w_id,
        pt_to_w_id: p_transfer.pt_to_w_id,
        pt_send_date: p_transfer.pt_send_date,
        pt_created_by: p_transfer.pt_created_by,
      });

      let pt_product_input: IptProductInput[] = [];

      pt_product.forEach((el: any) => {
        pt_product_input.push({
          ptp_pt_id: ptRes[0],
          ptp_p_id: el.ptp_p_id,
          ptp_quantity: el.ptp_quantity,
        });
      });

      // inserted product transfer product table
      const ptInputRes = await trx('pt_product').insert(pt_product_input);

      //  remove product from inventory warehouse
      let removeProductFromInventory: IremoveProductFromInventory[] = [];
      let removeProductIDFromInventory: number[] = [];

      pt_product.forEach((el: any) => {
        removeProductFromInventory.push({
          i_p_id: el.ptp_p_id,
          i_quantity_available: el.ptp_quantity,
        });

        removeProductIDFromInventory.push(el.ptp_p_id);
      });

      // getting data which product transfer from inventory
      const getTransferProduct = await trx('inventory')
        .select('i_p_id', 'i_quantity_available')
        .andWhere('i_w_id', p_transfer.pt_from_w_id)
        .whereIn('i_p_id', removeProductIDFromInventory);

      // updating quantity which product transfer from inventory
      for (let i = 0; i < getTransferProduct.length; i++) {
        const transferItem = getTransferProduct[i];
        const removeItem = removeProductFromInventory.find(
          (item) => item.i_p_id === transferItem.i_p_id
        );

        if (removeItem) {
          transferItem.i_quantity_available -= removeItem.i_quantity_available;
        }
      }

      // inserted update product quantity in inventory
      await Promise.all(
        getTransferProduct.map(async (p: IUpdateInventoryProduct) => {
          await trx('inventory')
            .update({ i_quantity_available: p.i_quantity_available })
            .andWhere({ i_p_id: p.i_p_id })
            .andWhere({ i_w_id: p_transfer.pt_from_w_id });
        })
      );

      // product attribute start
      if (ptp_attribute) {
        let removeProductAttbProductIDFromInventory: any[] = [];
        ptp_attribute.forEach((el: IptAttribute) => {
          removeProductAttbProductIDFromInventory.push(el.ptp_p_id);
        });

        // getting product attribute from inventory attribute
        const getTransferProductFrmInventoryAtbb: IgetTransferProductInventoryAtbb[] =
          await trx('inventory AS i')
            .select(
              'i.i_p_id',
              'ia.ia_id',
              'ia.i_av_id',
              'ia.ia_quantity_available'
            )
            .join('inventory_attribute AS ia', 'i.i_id', 'ia.ia_i_id')
            .andWhere('i.i_w_id', p_transfer.pt_from_w_id)
            .whereIn('i.i_p_id', removeProductAttbProductIDFromInventory);

        let inventoryAttributes: IgetTransferProductInventoryAtbb[] = [];

        // differentiate ptp_attribute value from getTransferProductFrmInventoryAtbb, cause getting multiple attribute from getTransferProductFrmInventoryAtbb because of join
        for (let i = 0; i < ptp_attribute.length; i++) {
          for (let j = 0; j < getTransferProductFrmInventoryAtbb.length; j++) {
            if (
              ptp_attribute[i].ptp_p_id ===
                getTransferProductFrmInventoryAtbb[j].i_p_id &&
              ptp_attribute[i].ptpa_av_id ===
                getTransferProductFrmInventoryAtbb[j].i_av_id
            ) {
              inventoryAttributes.push(getTransferProductFrmInventoryAtbb[j]);
            }
          }
        }

        // updating quantity which product atttribute transfer from inventory
        for (let i = 0; i < inventoryAttributes.length; i++) {
          const transferAtbItem = inventoryAttributes[i];
          const removeItem = ptp_attribute.find(
            (item) =>
              item.ptp_p_id === transferAtbItem.i_p_id &&
              item.ptpa_av_id === transferAtbItem.i_av_id
          );

          if (removeItem) {
            transferAtbItem.ia_quantity_available -= removeItem.ptpa_quantity;
          }
        }

        // inserted update product attribute quantity in inventory attribute
        await Promise.all(
          inventoryAttributes.map(
            async (atb: IgetTransferProductInventoryAtbb) => {
              await trx('inventory_attribute')
                .update({ ia_quantity_available: atb.ia_quantity_available })
                .andWhere({ ia_id: atb.ia_id });
            }
          )
        );

        // inserted product transfer product attribute
        let ptp_attributeVal: IptpAttributeVal[] = [];

        for (let h = 0; h < pt_product.length; h++) {
          for (let i = 0; i < ptp_attribute.length; i++) {
            if (pt_product[h].ptp_p_id === ptp_attribute[i].ptp_p_id) {
              ptp_attributeVal.push({
                ptpa_av_id: ptp_attribute[i].ptpa_av_id,
                ptpa_quantity: ptp_attribute[i].ptpa_quantity,
                ptpa_ptp_id: ptInputRes[0] + h,
              });
            }
          }
        }

        const ptpAtbRes = await trx('ptp_attribute').insert(ptp_attributeVal);
      }

      if (ptInputRes.length) {
        return {
          success: true,
          message: 'Product transferred successfully',
        };
      } else {
        return {
          success: false,
          message: 'Product cannot transfer at this moment',
        };
      }
    });
  }

  // get all transfer product
  public async getAllTransferProductService(req: Request) {
    const { warehouse_id, transfer_from, transfer_to } = req.query;
    const data = await this.db('pt_product AS ptp')
      .select(
        'pd.p_id',
        'pd.p_name',
        'ptp.ptp_quantity',
        'pt.pt_send_date',
        'pt.pt_from_w_id',
        'pt.pt_to_w_id'
      )
      .join('p_transfer AS pt', 'ptp.ptp_pt_id', 'pt.pt_id')
      .join('product AS pd', 'ptp.ptp_p_id', 'pd.p_id')
      .where(function () {
        if (transfer_from) {
          this.andWhere('pt.pt_from_w_id', transfer_from);
        }
        if (transfer_to) {
          this.andWhere('pt.pt_to_w_id', transfer_to);
        }
      });

    return {
      success: true,
      data,
    };
  }

  // get a single transfer product
  public async getSingleTransferProductService(req: Request) {
    const { id } = req.params;
    const data = await this.db('pt_product AS ptp')
      .select(
        'pd.p_id',
        'pd.p_name',
        'pt.pt_id',
        'pt.pt_from_w_id',
        'pt.pt_to_w_id',
        'pt.pt_send_date',
        'pt.pt_created_by',
        'pt.pt_recieved_date',
        'wh.w_id',
        'wh.w_name',
        'wh.w_address',
        'wh.w_phone',
        'wh.w_email',
        'ptp.ptp_id',
        'ptp.ptp_quantity',
        'pta.ptpa_id',
        'pta.ptpa_av_id',
        'pta.ptpa_quantity',
        'av.av_value'
      )
      .leftJoin('product AS pd', 'ptp.ptp_p_id', 'pd.p_id')
      .leftJoin('p_transfer AS pt', 'ptp.ptp_pt_id', 'pt.pt_id')
      .leftJoin('warehouse AS wh', 'pt.pt_from_w_id', 'wh.w_id')
      .leftJoin('ptp_attribute AS pta', 'ptp.ptp_id', 'pta.ptpa_ptp_id')
      .leftJoin('attribute_value AS av', 'pta.ptpa_av_id', 'av.av_id')
      .where('ptp.ptp_p_id', id);

    let data2: any = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;
      for (let j = 0; j < data2.length; j++) {
        if (data[i].p_id === data[j].p_id) {
          found = true;

          data2[j].ptp_attribute.push({
            ptpa_id: data[i].ptpa_id,
            ptpa_av_id: data[i].ptpa_av_id,
            ptpa_quantity: data[i].ptpa_quantity,
            av_value: data[i].av_value,
          });
        }
      }
      if (!found) {
        data2.push({
          p_id: data[i].p_id,
          p_name: data[i].p_name,
          pt_id: data[i].pt_id,
          pt_from_w_id: data[i].pt_from_w_id,
          pt_to_w_id: data[i].pt_to_w_id,
          pt_recieved_date: data[i].pt_recieved_date,
          pt_created_by: data[i].pt_created_by,
          w_id: data[i].w_id,
          w_name: data[i].w_name,
          w_address: data[i].w_address,
          w_phone: data[i].w_phone,
          w_email: data[i].w_email,
          ptp_id: data[i].ptp_id,
          ptp_quantity: data[i].ptp_quantity,
          ptp_attribute: [
            {
              ptpa_id: data[i].ptpa_id,
              ptpa_av_id: data[i].ptpa_av_id,
              ptpa_quantity: data[i].ptpa_quantity,
              av_value: data[i].av_value,
            },
          ],
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
        message: 'Damage product not found with this product id',
      };
    }
  }

  // update a transfer
  public async updateTransferService(req: Request) {
    const { au_id } = req.user;
    const { id } = req.params;
    const { pt_status } = req.body;

    const checkTransfer = await this.db('p_transfer')
      .select('pt_id', 'pt_to_w_id')
      .where({ pt_id: id });

    if (!checkTransfer.length) {
      return {
        success: false,
        message: 'Single transfer not found with this transfer id',
      };
    }

    return await this.db.transaction(async (trx) => {
      // getting transfer to warehouse
      const getWarehouese = await this.db('p_transfer')
        .select('pt_to_w_id')
        .where({ pt_id: id });

      const { pt_to_w_id } = getWarehouese[0];

      // getting product by product transfer id
      const getPtProduct: IgetPtProduct[] = await this.db('pt_product')
        .select('ptp_id', 'ptp_pt_id', 'ptp_p_id', 'ptp_quantity')
        .where({ ptp_pt_id: id });

      let productIDFromPtProduct: number[] = [];
      let addProductIntoInventory: IaddProductIntoInventory[] = [];

      getPtProduct.forEach((el: IgetPtProduct) => {
        addProductIntoInventory.push({
          i_w_id: pt_to_w_id,
          i_p_id: el.ptp_p_id,
          i_quantity_available: el.ptp_quantity,
        });
        productIDFromPtProduct.push(el.ptp_p_id);
      });

      // getting data which product transfer from inventory
      const getTransferProductFmInventory: IgetTransferProduct[] | [] =
        await trx('inventory')
          .select('i_id', 'i_p_id', 'i_quantity_available')
          .andWhere('i_w_id', pt_to_w_id)
          .whereIn('i_p_id', productIDFromPtProduct);

      if (!getTransferProductFmInventory.length) {
        await trx('inventory').insert(addProductIntoInventory);
      } else if (
        getTransferProductFmInventory.length !== productIDFromPtProduct.length
      ) {
        // else if because one product can be stored in warehouse but other product cannot be warehouse

        // so now see what product has been stored in warehouse and which is not, we will different them, then we will  update and insert that product

        let whichProductHasnotStored: IaddProductIntoInventory[] = [];

        for (let i = 0; i < getPtProduct.length; i++) {
          for (let j = 0; j < getTransferProductFmInventory.length; j++) {
            if (
              getPtProduct[i].ptp_p_id !==
              getTransferProductFmInventory[j].i_p_id
            ) {
              whichProductHasnotStored.push({
                i_w_id: pt_to_w_id,
                i_p_id: getPtProduct[i].ptp_p_id,
                i_quantity_available: getPtProduct[i].ptp_quantity,
              });
            }
          }
        }

        await trx('inventory').insert(whichProductHasnotStored);

        // updating quantity which product transfer from inventory
        for (let i = 0; i < getTransferProductFmInventory.length; i++) {
          const transferItem = getTransferProductFmInventory[i];
          const addItem = getPtProduct.find(
            (item) => item.ptp_p_id === transferItem.i_p_id
          );

          if (addItem) {
            transferItem.i_quantity_available += addItem.ptp_quantity;
          }
        }

        await Promise.all(
          getTransferProductFmInventory.map(async (p) => {
            await trx('inventory')
              .update({ i_quantity_available: p.i_quantity_available })
              .andWhere({ i_id: p.i_id });
          })
        );
      } else {
        // updating quantity which product transfer from inventory
        for (let i = 0; i < getTransferProductFmInventory.length; i++) {
          const transferItem = getTransferProductFmInventory[i];
          const addItem = getPtProduct.find(
            (item) => item.ptp_p_id === transferItem.i_p_id
          );

          if (addItem) {
            transferItem.i_quantity_available += addItem.ptp_quantity;
          }
        }

        await Promise.all(
          getTransferProductFmInventory.map(async (p) => {
            await trx('inventory')
              .update({ i_quantity_available: p.i_quantity_available })
              .andWhere({ i_id: p.i_id });
          })
        );
      }

      // ============= product attribute ====================//

      const getProductTpAttb: IgetProductTpAttb[] | [] = await this.db(
        'pt_product AS ptp'
      )
        .select(
          'ptp.ptp_id',
          'ptp.ptp_p_id',
          'ptp_atb.ptpa_id',
          'ptp_atb.ptpa_av_id',
          'ptp_atb.ptpa_quantity'
        )
        .join('ptp_attribute AS ptp_atb', 'ptp.ptp_id', 'ptp_atb.ptpa_ptp_id')
        .where({ ptp_pt_id: id });

      if (getProductTpAttb.length) {
        // getting product attribute from inventory attribute
        const getInventoryAtbbByTransferProduct: IgetTransferProductInventoryAtbb[] =
          await trx('inventory AS i')
            .select(
              'i.i_id',
              'i.i_p_id',
              'ia.ia_id',
              'ia.i_av_id',
              'ia.ia_quantity_available'
            )
            .join('inventory_attribute AS ia', 'i.i_id', 'ia.ia_i_id')
            .andWhere('i.i_w_id', pt_to_w_id)
            .whereIn('i.i_p_id', productIDFromPtProduct);

        if (!getInventoryAtbbByTransferProduct.length) {
          const getAgainTransferProductFmInventory: IgetTransferProduct[] | [] =
            await trx('inventory')
              .select('i_id', 'i_p_id', 'i_quantity_available')
              .andWhere('i_w_id', pt_to_w_id)
              .whereIn('i_p_id', productIDFromPtProduct);

          let inventortyAtb = [];

          for (let i = 0; i < getProductTpAttb.length; i++) {
            for (
              let j = 0;
              j < getAgainTransferProductFmInventory.length;
              j++
            ) {
              if (
                getProductTpAttb[i].ptp_p_id ===
                getAgainTransferProductFmInventory[j].i_p_id
              ) {
                inventortyAtb.push({
                  ia_i_id: getAgainTransferProductFmInventory[j].i_id,
                  i_av_id: getProductTpAttb[i].ptpa_av_id,
                  ia_quantity_available: getProductTpAttb[i].ptpa_quantity,
                });
              }
            }
          }

          await trx('inventory_attribute').insert(inventortyAtb);
        } else {
          // updating attribute quantity which product transfer to inventory
          for (let i = 0; i < getInventoryAtbbByTransferProduct.length; i++) {
            const transferItem = getInventoryAtbbByTransferProduct[i];
            const addItem = getProductTpAttb.find(
              (item) =>
                item.ptp_p_id === transferItem.i_p_id &&
                item.ptpa_av_id === transferItem.i_av_id
            );

            if (addItem) {
              transferItem.ia_quantity_available += addItem.ptpa_quantity;
            }
          }

          // inserted update product attribute quantity in inventory attribute
          await Promise.all(
            getInventoryAtbbByTransferProduct.map(
              async (atb: IgetTransferProductInventoryAtbb) => {
                await trx('inventory_attribute')
                  .update({ ia_quantity_available: atb.ia_quantity_available })
                  .andWhere({ ia_id: atb.ia_id });
              }
            )
          );
        }
      }

      const updateRes = await this.db('p_transfer')
        .update({ pt_status, pt_updated_by: au_id })
        .where({ pt_id: id });

      console.log({ updateRes });

      if (updateRes) {
        return {
          success: true,
          message: 'Transfer product update successfully',
        };
      } else {
        return {
          success: false,
          message: 'Transfer product cannot update at this moment',
        };
      }
    });
  }
}

export default AdminTransferProductService;
