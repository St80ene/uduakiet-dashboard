import type { IPermission } from './permission.interface';

export interface IRolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  permission: IPermission;
  created_at: Date;
  updated_at: Date;
}
