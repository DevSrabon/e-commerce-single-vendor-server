import { Request } from 'express';
import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminRolePermissionService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // create module service
  public async createModuleService(req: Request) {
    const { module_name, sub_module, module_created_by } = req.body;

    const resModule = await this.db('module').insert({
      module_name,
      module_created_by,
    });

    const subModuleBody = sub_module.map((item: string) => {
      return {
        module_id: resModule[0],
        sub_module_name: item,
      };
    });

    const data = await this.db('sub_module').insert(subModuleBody);
    if (data.length) {
      return {
        success: true,
        data: {
          module_id: resModule[0],
        },
        message: 'Modules created successfully',
      };
    } else {
      return {
        success: false,
        message: 'Cannot create modules',
      };
    }
  }

  // create a role
  public async createRole(req: Request) {
    return this.db.transaction(async (trx) => {
      const { role_name, role_created_by, sub_module } = req.body;

      const roleRes = await trx('role').insert({
        role_name,
        role_created_by,
      });

      const body = sub_module.map((sm: any) => {
        return {
          sub_module_id: sm.sub_module_id,
          role_id: roleRes[0],
          read: sm.read,
          write: sm.write,
          update: sm.update,
          delete: sm.delete,
        };
      });

      await trx('role_permission').insert(body);

      return {
        success: true,
        data: { role_id: roleRes[0] },
        message: 'Role created successfully',
      };
    });
  }

  // update a role
  public async updateRole(req: Request) {
    const { id } = req.params;

    const { role_name, added_sub_modules, delete_sub_modules } = req.body;

    return this.db.transaction(async (trx) => {
      let res;
      if (role_name) {
        res = await trx('role').update({ role_name }).where({ role_id: id });
      }

      if (added_sub_modules) {
        res = await trx('role_permission')
          .insert(added_sub_modules)
          .where({ role_id: id });
      }

      if (delete_sub_modules) {
        res = await trx('role_permission')
          .whereIn('sub_module_id', delete_sub_modules)
          .del();
      }

      if (res) {
        return {
          success: true,
          message: 'Role updated successfully',
        };
      }

      return {
        success: false,
        message: 'Role cannot update',
      };
    });
  }

  // get all module
  public async getAllModule() {
    const data = await this.db('module AS m')
      .select(
        'm.module_id',
        'm.module_name',
        'sm.sub_module_id',
        'sm.sub_module_name'
      )
      .join('sub_module AS sm', 'm.module_id', 'sm.module_id');

    let data2 = [];

    for (let i = 0; i < data.length; i++) {
      let found = false;
      for (let j = 0; j < data2.length; j++) {
        if (data[i].module_id === data2[j].module_id) {
          found = true;
          data2[j].sub_module.push({
            sub_module_id: data[i].sub_module_id,
            sub_module_name: data[i].sub_module_name,
          });
        }
      }

      if (!found) {
        data2.push({
          module_name: data[i].module_name,
          module_id: data[i].module_id,
          sub_module: [
            {
              sub_module_id: data[i].sub_module_id,
              sub_module_name: data[i].sub_module_name,
            },
          ],
        });
      }
    }

    return {
      success: true,
      data: data2,
    };
  }

  // get all role
  public async getAllRole() {
    const data = await this.db('role').select('role_id', 'role_name');
    return {
      success: true,
      data,
    };
  }
  // get single role
  public async getSingleRole(req: Request) {
    const { id } = req.params;
    const data = await this.db('role')
      .select('role_id', 'role_name')
      .where({ role_id: id });

    const rolePermissionRes = await this.db('role_permission AS rp')
      .select(
        'm.module_name',
        'm.module_id',
        'sm.sub_module_id',
        'sm.sub_module_name',
        'rp.read',
        'rp.write',
        'rp.update',
        'rp.delete'
      )
      .join('sub_module AS sm', 'rp.sub_module_id', 'sm.sub_module_id')
      .join('module AS m', 'sm.module_id', 'm.module_id')
      .where({ role_id: id });

    let data2 = [];

    for (let i = 0; i < rolePermissionRes.length; i++) {
      let found = false;
      for (let j = 0; j < data2.length; j++) {
        if (rolePermissionRes[i].module_id === data2[j].module_id) {
          found = true;
          data2[j].sub_module.push({
            sub_module_id: rolePermissionRes[i].sub_module_id,
            sub_module_name: rolePermissionRes[i].sub_module_name,
            read: rolePermissionRes[i].read,
            write: rolePermissionRes[i].write,
            update: rolePermissionRes[i].update,
            delete: rolePermissionRes[i].delete,
          });
        }
      }

      if (!found) {
        data2.push({
          module_name: rolePermissionRes[i].module_name,
          module_id: rolePermissionRes[i].module_id,
          sub_module: [
            {
              sub_module_id: rolePermissionRes[i].sub_module_id,
              sub_module_name: rolePermissionRes[i].sub_module_name,
              read: rolePermissionRes[i].read,
              write: rolePermissionRes[i].write,
              update: rolePermissionRes[i].update,
              delete: rolePermissionRes[i].delete,
            },
          ],
        });
      }
    }

    return {
      success: true,
      data: { role: { ...data[0] }, can_access_modules: data2 },
    };
  }
}

export default AdminRolePermissionService;
