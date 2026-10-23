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
  data?: Record<string, unknown> | null;
  created_at: Date | string;
}
