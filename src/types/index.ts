import type { ProductStatus } from '@/enum/product';
import type { PaginationMeta } from '@/interfaces';
import type { AuditLog } from '@/interfaces/auditlog';
import type { IBusiness } from '@/interfaces/business.interface';
import type { ICategory } from '@/interfaces/category.interface';
import type { IStock } from '@/interfaces/stock.interface';
import type { IStockMovement } from '@/interfaces/stock_movements.interface';
import type { IStore } from '@/interfaces/store.interface';
import type { IUser } from '@/interfaces/user.interface';

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

export enum UomType {
  UNIT = 'UNIT',
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
}

export enum UomBaseName {
  PCS = 'pcs',
  G = 'g',
  ML = 'ml',
}

export enum UomDisplayName {
  PCS = 'pcs',
  G = 'g',
  KG = 'kg',
  ML = 'ml',
  L = 'L',
}

export interface ProductImage {
  url: string;
  publicId?: string;
  publicID?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  images: CloudinaryImage[];
  cost_price: number;
  selling_price: number;
  uom_type: UomType;
  uom_base_name: UomBaseName;
  uom_display_name: UomDisplayName;
  status: ProductStatus;
  stocks: IStock[];
  category_id: string | null;
  business_id: string;
  category?: ICategory | null;
  suppliers?: Supplier[];
  purchase_orders?: PurchaseOrder[];
  business: IBusiness;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  status: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  total_estimated_cost: number;
  createdAt: string;
  items: { product_name: string; quantity: number; cost: number }[];
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  last_purchase_price?: number;
  lead_time_days?: number;
  is_primary?: boolean;
  is_active?: boolean;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  status: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  total_estimated_cost: number;
  createdAt: string;
  items: { product_name: string; quantity: number; cost: number }[];
}

export type PaginatedResponse<T, K extends string> = {
  [P in K]: T[];
} & {
  meta: PaginationMeta;
};

export type ProductsResponse = PaginatedResponse<Product, 'products'>;

export type CategoriesResponse = PaginatedResponse<ICategory, 'categories'>;
export type UsersResponse = PaginatedResponse<IUser, 'users'>;
export type StoresResponse = PaginatedResponse<IStore, 'stores'>;
export type SuppliersResponse = PaginatedResponse<Supplier, 'suppliers'>;
export type StocksResponse = PaginatedResponse<IStock, 'stocks'>;
export type PurchaseOrdersResponse = PaginatedResponse<
  PurchaseOrder,
  'purchase_orders'
>;
export type StockMovementsResponse = PaginatedResponse<
  IStockMovement,
  'stock_movements'
>;
export type AuditLogsResponse = PaginatedResponse<AuditLog, 'audit_logs'>;
