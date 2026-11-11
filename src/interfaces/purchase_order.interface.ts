import type { PurchaseOrderStatus } from '@/enum/purchase_order.enum';
import type { IProduct } from './products';
import type { ISupplier } from './supplier';
import type { IUser } from './user.interface';

export interface IPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product: IProduct | null; // Added to include product details
  quantity_requested: number;
  quantity_received: number;
  estimated_unit_cost: number;
  // Added to include supplier details
  total_cost: number;
}

export interface IReceivePurchaseOrderPayload {
  items: {
    item_id: string;
    quantity_received: number;
  }[];
}

export interface CreatePoItemDto {
  product_id: string;

  quantity_requested: number; // e.g., 1500 for 1.5kg

  cost_price?: number; // e.g., 1500 for 1.5kg

  estimated_unit_cost?: number;
}

export interface IPurchaseOrder {
  id: string;
  po_number: string;
  supplier: ISupplier | null;
  supplier_name: string;
  supplier_id?: string | null;
  business_id: string;
  status: PurchaseOrderStatus;
  total_estimated_cost: number;
  items_count?: number; // Added for the list view count
  approved_by_id?: string;
  approved_by?: IUser | null;
  created_at: string | Date;
  items: IPurchaseOrderItem[];
  store_id?: string | null;
  created_by: IUser | null;
}

export interface ICreatePurchaseOrderFormData {
  items: CreatePoItemDto[];
}

export interface IUpdatePurchaseOrderFormData {
  items: CreatePoItemDto[];
}
