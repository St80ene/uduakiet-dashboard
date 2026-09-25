import type { UserRole } from '@/enum/role';
import type { IRolePermission } from './role_permission.interface';

export interface Role {
  id: string;
  name: UserRole;
  rolePermissions?: IRolePermission[];
  description: string | null;
  created_at: Date;
  updated_at: Date;
}
