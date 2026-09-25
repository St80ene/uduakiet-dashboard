import type { IAuditLog } from '@/interfaces/auditlog';
import type { IBusiness } from '@/interfaces/business.interface';
import type { IPurchaseOrder } from '@/interfaces/purchase_order.interface';
import type { IUser } from '@/interfaces/user.interface';

export interface Store {
  id: string;

  business_id: string;

  business: IBusiness;

  name: string;

  code: string;

  address?: string;

  city?: string;

  state?: string;

  country?: string;

  phone_number?: string;

  audit_logs: IAuditLog[];

  users: IUser[];

  purchase_orders: IPurchaseOrder[];

  created_at: Date;

  updated_at: Date;

  deleted_at?: Date | null;
}
