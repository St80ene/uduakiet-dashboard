import type { IProductSource } from './product_source.interface';

export interface ISupplier {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  business_id: string;
  product_sources: IProductSource[];
  purchase_orders: IProductSource[];
  created_at?: Date;
  updated_at?: Date;
}
