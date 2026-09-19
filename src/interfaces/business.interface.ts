import type { IAuditLog } from './auditlog';
import type { IStore } from './store.interface';
import type { IUser } from './user.interface';
import type { ICategory } from './category.interface';
import type { ICloudinaryImage } from './cloudImage';
import type { IProduct } from './products';

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface IBusinessSettings {
  themeColor?: string;
  enableNotifications?: boolean;
  timezone?: string;

  [key: string]: unknown;
}

export interface IBusiness {
  id: string;

  // Identity
  legal_name: string;
  display_name: string;
  registration_number?: string | null;
  tax_identification_number?: string | null;
  business_type?: string | null;

  // Contact
  email?: string | null;
  phone_number?: string | null;
  website?: string | null;

  // Address
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  postal_code?: string | null;

  // Branding
  logo?: ICloudinaryImage | null;

  // Configuration
  currency: string;
  timezone: string;
  locale: string;
  tax_settings?: Record<string, unknown> | null;
  settings?: IBusinessSettings | null;

  // Relationships
  categories?: ICategory[];
  users?: IUser[];
  stores?: IStore[];
  products?: IProduct[];
  audit_logs?: IAuditLog[];

  // Timestamps
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IBusinessFormData {
  // Identity
  legal_name: string;
  display_name: string;
  registration_number?: string | null;
  tax_identification_number?: string | null;
  business_type?: string | null;
  phone_number?: string | null;
  website?: string | null;

  // Address
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  postal_code?: string | null;

  // Branding
  logo?: ICloudinaryImage | null;

  // Configuration
  currency: string;
  timezone: string;
  locale: string;
  tax_settings?: Record<string, unknown> | null;
  name: string;
  description: string;
  settings?: IBusinessSettings;
}
