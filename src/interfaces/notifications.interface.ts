export interface LowStockEvent {
  event_id: string;
  business_id: string;
  store_id: string;
  product_id: string;
  current_quantity: number;
  reorder_point: number;
  is_out_of_stock: boolean;
  occurred_at: Date;
  product_name: string;
  store_name: string;
}

export interface INotification {
  id: string;
  business_id: string;
  recipient_id: string;
  store_id?: string;
  source_event_id: string;
  type: string; // OutboxEventType
  title: string;
  message: string;
  is_read?: boolean;
  data: LowStockEvent;
  created_at: Date | string;
}
