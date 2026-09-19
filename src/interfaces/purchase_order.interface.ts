export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SENT_TO_SUPPLIER = 'SENT_TO_SUPPLIER',
}

export interface IPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product_name: string;
  quantity_requested: number;
  estimated_unit_cost: number;
}

export interface IPurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  status: PurchaseOrderStatus;
  total_estimated_cost: number;
  createdAt: string;
  items: IPurchaseOrderItem[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
