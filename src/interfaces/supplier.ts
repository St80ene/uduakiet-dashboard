export interface ISupplier {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  business_id: string;
  productSourcesCount?: number;
  purchaseOrdersCount?: number;
  created_at?: Date;
  updated_at?: Date;
}
