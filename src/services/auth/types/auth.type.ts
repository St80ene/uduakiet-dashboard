import type { Role } from '@/interfaces/role.interface';
import type { IBusiness } from '@/interfaces/business.interface';
import type { IUser } from '@/interfaces/user.interface';

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  company_email: string;
  role_id: string;
  business_id: string;
  store_id: string | null;
  is_active: boolean;
  role: Role;
  business: IBusiness;
}

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: IUser;
}
