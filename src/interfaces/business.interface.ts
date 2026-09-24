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
  themeColor?: string | undefined;
  enableNotifications?: boolean;
  enableMultiBranch?: boolean;
  lowStockThreshold?: number;
  enableReceiptQR?: boolean;
  receiptFooterText?: string;
  defaultTaxRate?: number;
}

export interface IToastProps {
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
}

export interface IBusiness {
  // Identity
  legal_name: string;
  display_name: string;
  registration_number: string;
  tax_identification_number: string;
  business_type: string;

  // Contact
  email: string;
  phone_number: string;
  website?: string | null;

  // Address
  address_line_1?: string | null;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;

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
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export type BusinessUpdate = Pick<
  IBusiness,
  | 'display_name'
  | 'phone_number'
  | 'website'
  | 'address_line_1'
  | 'address_line_2'
  | 'city'
  | 'state'
  | 'country'
  | 'postal_code'
  | 'settings'
>;

export interface IBusinessFormData {
  // Identity
  legal_name?: string;
  display_name?: string;
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
  country?: string;
  postal_code?: string | null;

  // Branding
  logo?: ICloudinaryImage | null;

  // Configuration
  currency?: string;
  timezone?: string;
  locale?: string;
  tax_settings?: Record<string, unknown> | null;
  name?: string;
  description?: string;
  settings?: IBusinessSettings;
}
