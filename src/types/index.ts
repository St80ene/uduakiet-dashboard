import type { IPaginationMeta } from '@/interfaces';
import type { IAuditLog } from '@/interfaces/auditlog';
import type { ICategory } from '@/interfaces/category.interface';
import type { IProduct } from '@/interfaces/products';
import type { IPurchaseOrder } from '@/interfaces/purchase_order.interface';
import type { IStock } from '@/interfaces/stock.interface';
import type { IStockMovement } from '@/interfaces/stock_movements.interface';
import type { IStore } from '@/interfaces/store.interface';
import type { ISupplier } from '@/interfaces/supplier';
import type { IUser } from '@/interfaces/user.interface';

export enum BadgeVariant {
  Danger = 'danger',
  Warning = 'warning',
  Brand = 'brand',
}

export interface IDynamicFaviconProps {
  /** Unread low-stock alerts or pending orders count */
  badgeCount?: number;
  /** Primary indicator theme: 'danger' (red) | 'warning' (amber) | 'brand' (cyan) */
  badgeVariant?: BadgeVariant;
  showBackground?: boolean;
}

export type PaginatedResponse<T, K extends string> = {
  [P in K]: T[];
} & {
  meta: IPaginationMeta;
};

export type ProductsResponse = PaginatedResponse<IProduct, 'products'>;

export type CategoriesResponse = PaginatedResponse<ICategory, 'categories'>;
export type UsersResponse = PaginatedResponse<IUser, 'users'>;
export type StoresResponse = PaginatedResponse<IStore, 'stores'>;
export type SuppliersResponse = PaginatedResponse<ISupplier, 'suppliers'>;
export type StocksResponse = PaginatedResponse<IStock, 'stocks'>;
export type PurchaseOrdersResponse = PaginatedResponse<
  IPurchaseOrder,
  'purchase_orders'
>;
export type StockMovementsResponse = PaginatedResponse<
  IStockMovement,
  'stock_movements'
>;
export type AuditLogsResponse = PaginatedResponse<IAuditLog, 'auditLogs'>;
export type BusinessResponse = PaginatedResponse<IAuditLog, 'business'>;
export type IPurchaseOrdersResponse = PaginatedResponse<
  IPurchaseOrder,
  'purchase_orders'
>;
