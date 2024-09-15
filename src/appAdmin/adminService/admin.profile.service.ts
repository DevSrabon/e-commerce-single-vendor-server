import AdminAbstractServices from '../adminAbstracts/admin.abstract.service';

class AdminProfileService extends AdminAbstractServices {
  constructor() {
    super();
  }

  // get admin profile data
  public async getAdminProfileData(id: string | number) {
    const data = await this.db('admin_user AS au')
      .select(
        'au.au_id',
        'au.au_name',
        'au.au_phone',
        'au.au_email',
        'au.au_photo',
        'r.role_name'
      )
      .join('role AS r', 'au.au_role', 'r.role_id')
      .where('au_id', id);
    if (data.length) {
      return {
        success: true,
        data: data[0],
      };
    } else {
      return {
        success: false,
        message: 'User not found',
      };
    }
  }
}
export default AdminProfileService;
