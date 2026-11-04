import type { PurchaseOrderStatus } from '@/enum/purchase_order.enum';

export interface IPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product_name: string;
  quantity_requested: number;
  quantity_received: number;
  estimated_unit_cost: number;
  total_cost: number;
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
  supplier_name: string;

  status: PurchaseOrderStatus;
  total_estimated_cost: number;
  items_count?: number; // Added for the list view count

  approved_by_id?: string;
  created_at: string | Date;
}

export interface ICreatePurchaseOrderFormData {
  items: CreatePoItemDto[];
}
