export interface ISupplier {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
  productSourcesCount?: number;
  purchaseOrdersCount?: number;
}
