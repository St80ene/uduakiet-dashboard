import type { CloudinaryImage, Product } from '@/types';
import type { AuditLog } from './auditlog';
import type { IStore } from './store.interface';
import type { IUser } from './user.interface';
import type { ICategory } from './category.interface';

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface BusinessSettings {
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
  logo?: CloudinaryImage | null;

  // Configuration
  currency: string;
  timezone: string;
  locale: string;
  tax_settings?: Record<string, unknown> | null;
  settings?: BusinessSettings | null;

  // Relationships
  categories?: ICategory[];
  users?: IUser[];
  stores?: IStore[];
  products?: Product[];
  audit_logs?: AuditLog[];

  // Timestamps
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BusinessFormData {
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
  logo?: CloudinaryImage | null;

  // Configuration
  currency: string;
  timezone: string;
  locale: string;
  tax_settings?: Record<string, unknown> | null;
  name: string;
  description: string;
  settings?: BusinessSettings;
}
