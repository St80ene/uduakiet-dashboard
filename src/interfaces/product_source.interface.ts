import type { IPaginationMeta } from '.';
import type { IProduct } from './products';
import type { ISupplier } from './supplier';

export interface IProductSource {
  id: string;
  product_id: string;
  supplier_id: string;
  product?: IProduct;
  cost_price: number;
  supplier_sku?: string;
  estimated_lead_time_days?: number;
  supplier: ISupplier;
  created_at: string;
}

export interface ProductSourcesResponse {
  product_sources: IProductSource[];
  meta: IPaginationMeta;
}

export interface IProductSourceFormData {
  product_id: string;
  supplier_id: string;
}
